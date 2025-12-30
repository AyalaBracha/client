// client/src/pages/AddCategoryPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCategory } from '../services/apiService';
import './AddCategoryPage.css';

function AddCategoryPage() {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('📁');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const availableIcons = [
    '🍎', '🥖', '🥛', '🥤', '🥫', '🥩', '🍔', '🍬', 
    '🍚', '🥗', '🍞', '🍕', '🍰', '☕', '🍷', '🧀', 
    '🥕', '🍇', '📁', '🍗'
  ];

  const selectIcon = (icon) => {
    setCategoryImage(icon);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setErrorMessage('שם הקטגוריה הוא שדה חובה');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const categoryToSend = {
      name: categoryName,
      image: categoryImage,
    };

    console.log('📤 שולח קטגוריה חדשה:', categoryToSend);

    try {
      const created = await addCategory(categoryToSend);
      console.log('✅ קטגוריה נוספה בהצלחה:', created);
      setSuccessMessage('הקטגוריה נוספה בהצלחה!');
      
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (error) {
      console.error('❌ שגיאה בהוספת קטגוריה:', error);
      setErrorMessage(error.message || 'אירעה שגיאה בהוספת הקטגוריה');
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    navigate('/categories');
  };

  return (
    <div className="add-category-container">
      <div className="form-card">
        <h2>➕ הוספת קטגוריה חדשה</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">שם הקטגוריה *</label>
            <input
              type="text"
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="הזן שם קטגוריה..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>בחר אייקון</label>
            <div className="icon-grid">
              {availableIcons.map((icon) => (
                <div
                  key={icon}
                  className={`icon-option ${
                    categoryImage === icon ? 'selected' : ''
                  }`}
                  onClick={() => selectIcon(icon)}
                >
                  {icon}
                </div>
              ))}
            </div>
            <div className="selected-icon">
              <span>אייקון נבחר:</span>
              <span className="icon-preview">{categoryImage}</span>
            </div>
          </div>

          {successMessage && (
            <div className="message success">✅ {successMessage}</div>
          )}

          {errorMessage && (
            <div className="message error">❌ {errorMessage}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={cancel}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!categoryName.trim() || loading}
            >
              {loading ? 'שומר...' : 'הוסף קטגוריה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCategoryPage;