// client/src/pages/SummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import selectionService from '../services/selectionService';
import { generateRecipe, sendEmail } from '../services/apiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './SummaryPage.css';

function SummaryPage() {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // הגדרות מתכון
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [servings, setServings] = useState(4);
  const [maxCalories, setMaxCalories] = useState(500);

  // שגיאות ולידציה
  const [servingsError, setServingsError] = useState('');
  const [caloriesError, setCaloriesError] = useState('');

  useEffect(() => {
    const selections = selectionService.getSelections();
    setSelectedProducts(selections);

    if (selections.length === 0) {
      navigate('/categories');
    }
  }, [navigate]);

  const validateServings = () => {
    if (!servings || servings < 1 || servings > 2000) {
      setServingsError('⚠️ מספר המנות חייב להיות בין 1 ל-2000');
    } else {
      setServingsError('');
    }
  };

  const validateCalories = () => {
    if (!maxCalories || maxCalories < 20 || maxCalories > 5000) {
      setCaloriesError('⚠️ קלוריות למנה חייבות להיות בין 20 ל-5000');
    } else {
      setCaloriesError('');
    }
  };

  const hasValidationErrors = () => {
    return servingsError !== '' || caloriesError !== '';
  };

  const removeProduct = (productId) => {
    selectionService.removeProduct(productId);
    const updated = selectionService.getSelections();
    setSelectedProducts(updated);

    if (updated.length === 0) {
      navigate('/categories');
    }
  };

  const goBack = () => {
    navigate('/categories');
  };

  const generateRecipeHandler = async () => {
    validateServings();
    validateCalories();

    if (hasValidationErrors()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setRecipe(null);

    const ingredients = selectionService.getIngredientsForRecipe();

    const request = {
      ingredients,
      vegetarian,
      vegan,
      glutenFree,
      servings,
      maxCalories,
    };

    console.log('📤 שולח בקשה ליצירת מתכון:', request);

    try {
      const res = await generateRecipe(request);
      console.log('✅ מתכון נוצר בהצלחה:', res);
      setRecipe(res);
      selectionService.clearAll();
      setSelectedProducts([]);
    } catch (error) {
      console.error('❌ שגיאה ביצירת המתכון:', error);
      setErrorMessage(error.message || 'אירעה שגיאה ביצירת המתכון');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    selectionService.clearAll();
    navigate('/categories');
  };

  const downloadPDF = async () => {
    if (!recipe) {
      alert('אין מתכון להורדה');
      return;
    }

    try {
      const htmlContent = createHTMLContent();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.right = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.direction = 'rtl';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${recipe.title}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('שגיאה ביצירת PDF:', error);
      alert('אירעה שגיאה ביצירת הקובץ');
    }
  };

  const createHTMLContent = () => {
    if (!recipe) return '';

    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 20px;">
          ${recipe.title}
        </h1>
    `;

    if (recipe.description) {
      html += `
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          ${recipe.description}
        </p>
      `;
    }

    html += `
      <h2 style="color: #e74c3c; margin-top: 30px; margin-bottom: 15px;">מצרכים:</h2>
      <ul style="list-style-type: disc; padding-right: 20px; line-height: 1.8;">
    `;

    recipe.ingredients.forEach((ingredient) => {
      html += `<li style="margin-bottom: 8px; color: #333;">${ingredient}</li>`;
    });

    html += `</ul>`;

    html += `
      <h2 style="color: #27ae60; margin-top: 30px; margin-bottom: 15px;">הוראות הכנה:</h2>
      <ol style="padding-right: 20px; line-height: 1.8;">
    `;

    recipe.instructions.forEach((instruction) => {
      html += `<li style="margin-bottom: 12px; color: #333;">${instruction}</li>`;
    });

    html += `</ol>`;

    if (recipe.notes && recipe.notes.length > 0) {
      html += `
        <h2 style="color: #f39c12; margin-top: 30px; margin-bottom: 15px;">הערות:</h2>
        <ul style="list-style-type: circle; padding-right: 20px; line-height: 1.8;">
      `;

      recipe.notes.forEach((note) => {
        html += `<li style="margin-bottom: 8px; color: #666;">${note}</li>`;
      });

      html += `</ul>`;
    }

    html += `</div>`;

    return html;
  };

  return (
    <div className="summary-container">
      <div className="header">
        <button className="back-btn" onClick={goBack}>
          ← חזור
        </button>
        <h1>סיכום המוצרים</h1>
      </div>

      {!recipe && (
        <div className="selected-products">
          <h2>המוצרים שנבחרו ({selectedProducts.length})</h2>

          <div className="products-list">
            {selectedProducts.map((item) => (
              <div key={item.product.id} className="product-item">
                <div className="product-info">
                  <span className="product-icon">{item.product.image}</span>
                  <div>
                    <strong>{item.product.name}</strong>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeProduct(item.product.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="recipe-settings">
            <h3>העדפות מתכון</h3>

            <div className="settings-grid">
              <div className="setting-item">
                <label htmlFor="servings">מספר מנות: *</label>
                <input
                  type="number"
                  id="servings"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  onBlur={validateServings}
                  min="1"
                  max="2000"
                  className={servingsError ? 'invalid' : ''}
                />
                {servingsError && (
                  <span className="error-text">{servingsError}</span>
                )}
              </div>

              <div className="setting-item">
                <label htmlFor="maxCalories">קלוריות מקסימליות למנה: *</label>
                <input
                  type="number"
                  id="maxCalories"
                  value={maxCalories}
                  onChange={(e) => setMaxCalories(Number(e.target.value))}
                  onBlur={validateCalories}
                  min="20"
                  max="5000"
                  className={caloriesError ? 'invalid' : ''}
                />
                {caloriesError && (
                  <span className="error-text">{caloriesError}</span>
                )}
              </div>
            </div>

            <div className="checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={vegetarian}
                  onChange={(e) => setVegetarian(e.target.checked)}
                />
                <span>🥬 צמחוני</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={vegan}
                  onChange={(e) => setVegan(e.target.checked)}
                />
                <span>🌱 טבעוני</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={glutenFree}
                  onChange={(e) => setGlutenFree(e.target.checked)}
                />
                <span>🌾 ללא גלוטן</span>
              </label>
            </div>
          </div>

          <div className="actions">
            <button
              className="generate-btn"
              onClick={generateRecipeHandler}
              disabled={loading || hasValidationErrors()}
            >
              {loading ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  <span>מייצר מתכון...</span>
                </span>
              ) : (
                '🎯 צור מתכון'
              )}
            </button>
            <button className="clear-btn" onClick={startOver}>
              🔄 התחל מחדש
            </button>
          </div>
        </div>
      )}

      {errorMessage && <div className="error-message">❌ {errorMessage}</div>}

      {recipe && (
        <div className="recipe-result">
          <h2>{recipe.title}</h2>

          {recipe.description && (
            <div className="recipe-section">
              <h3>📝 תיאור</h3>
              <p>{recipe.description}</p>
            </div>
          )}

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="recipe-section">
              <h3>🛒 מצרכים</h3>
              <ul>
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="recipe-section">
              <h3>👨‍🍳 הוראות הכנה</h3>
              <ol>
                {recipe.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {recipe.nutrition && (
            <div className="recipe-section">
              <h3>📊 ערכים תזונתיים</h3>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <strong>סה"כ קלוריות:</strong>
                  <span>{recipe.nutrition.caloriesTotal}</span>
                </div>
                <div className="nutrition-item">
                  <strong>קלוריות למנה:</strong>
                  <span>{recipe.nutrition.caloriesPerServing}</span>
                </div>
                <div className="nutrition-item">
                  <strong>חלבון למנה:</strong>
                  <span>{recipe.nutrition.proteinPerServing}</span>
                </div>
                <div className="nutrition-item">
                  <strong>פחמימות למנה:</strong>
                  <span>{recipe.nutrition.carbsPerServing}</span>
                </div>
                <div className="nutrition-item">
                  <strong>שומן למנה:</strong>
                  <span>{recipe.nutrition.fatPerServing}</span>
                </div>
              </div>
            </div>
          )}

          {recipe.notes && recipe.notes.length > 0 && (
            <div className="recipe-section">
              <h3>💡 הערות וטיפים</h3>
              <ul className="notes-list">
                {recipe.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="recipe-actions">
            <button className="download-btn" onClick={downloadPDF}>
              📥 הורד כ-PDF
            </button>
            <button
              className="email-btn"
              onClick={() => setShowEmailPopup(true)}
            >
              ✉️ שלח למייל
            </button>
            <button className="start-over-btn" onClick={startOver}>
              🔄 צור מתכון נוסף
            </button>
          </div>
        </div>
      )}

      {showEmailPopup && (
        <EmailPopup
          recipeHtml={createHTMLContent()}
          recipeTitle={recipe?.title || ''}
          onClose={() => setShowEmailPopup(false)}
        />
      )}
    </div>
  );
}

// Email Popup Component
function EmailPopup({ recipeHtml, recipeTitle, onClose }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setMessage('❌ כתובת מייל אינה תקינה');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      await sendEmail({
        to: email,
        subject: `📖 מתכון: ${recipeTitle}`,
        html: recipeHtml,
      });
      setMessage('✅ המייל נשלח בהצלחה!');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMessage('❌ שגיאה בשליחת המייל.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-popup-overlay" onClick={onClose}>
      <div className="email-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="header-icon">✉️</div>
          <h2>שליחת מתכון למייל</h2>
          <button type="button" className="close-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="email-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              כתובת מייל
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
            />
          </div>

          {message && (
            <div
              className={`system-message ${
                message.includes('נשלח') || message.includes('הצלחה')
                  ? 'success'
                  : 'error'
              }`}
            >
              {message}
            </div>
          )}

          <div className="action-buttons">
            <button
              type="button"
              className="send-btn"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? (
                <span className="sending-state">
                  <span className="spinner">⏳</span>
                  שולח...
                </span>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  שליחה
                </>
              )}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={sending}
            >
              <span className="btn-icon">✗</span>
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryPage;