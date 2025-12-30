// client/src/services/selectionService.js

class SelectionService {
  constructor() {
    this.selectedProducts = new Map();
    this.loadFromStorage();
  }

  /**
   * יצירת מפתח ייחודי למוצר
   */
  getProductKey(product) {
    return `${product.categoryId}-${product.id}`;
  }

  /**
   * קבלת כל המוצרים שנבחרו
   */
  getSelections() {
    return Array.from(this.selectedProducts.values());
  }

  /**
   * הוספה/עדכון של מוצר
   */
  addProduct(product, quantity = 1) {
    const key = this.getProductKey(product);
    console.log(`➕ מוסיף/מעדכן מוצר: ${product.name} (Key: ${key}), כמות: ${quantity}`);
    
    this.selectedProducts.set(key, { 
      product: { ...product },
      quantity 
    });
    
    this.saveToStorage();
  }

  /**
   * הסרת מוצר
   */
  removeProduct(productId) {
    let foundKey = null;
    
    for (const [key, selected] of this.selectedProducts.entries()) {
      if (selected.product.id === productId) {
        foundKey = key;
        break;
      }
    }
    
    if (foundKey) {
      const product = this.selectedProducts.get(foundKey);
      console.log(`❌ מסיר מוצר: ${product?.product.name} (Key: ${foundKey})`);
      this.selectedProducts.delete(foundKey);
      this.saveToStorage();
    }
  }

  /**
   * ניקוי כל המוצרים
   */
  clearAll() {
    console.log('🗑️ מנקה את כל המוצרים שנבחרו');
    this.selectedProducts.clear();
    this.saveToStorage();
  }

  /**
   * מספר המוצרים הייחודיים שנבחרו
   */
  getTotalItems() {
    return this.selectedProducts.size;
  }

  /**
   * סך כמות כל המוצרים
   */
  getTotalQuantity() {
    let total = 0;
    this.selectedProducts.forEach(sp => {
      total += sp.quantity;
    });
    return total;
  }

  /**
   * בדיקה אם מוצר נבחר
   */
  isProductSelected(productId) {
    for (const selected of this.selectedProducts.values()) {
      if (selected.product.id === productId) {
        return true;
      }
    }
    return false;
  }

  /**
   * קבלת כמות של מוצר ספציפי
   */
  getProductQuantity(productId) {
    for (const selected of this.selectedProducts.values()) {
      if (selected.product.id === productId) {
        return selected.quantity;
      }
    }
    return 0;
  }

  /**
   * המרה לפורמט של RecipeRequest (רשימת שמות מוצרים)
   */
  getIngredientsForRecipe() {
    const ingredients = [];
    
    this.selectedProducts.forEach(sp => {
      if (sp.quantity > 1) {
        ingredients.push(`${sp.product.name} (${sp.quantity})`);
      } else {
        ingredients.push(sp.product.name);
      }
    });
    
    console.log('📝 מצרכים למתכון:', ingredients);
    return ingredients;
  }

  /**
   * שמירה ב-localStorage
   */
  saveToStorage() {
    try {
      const data = Array.from(this.selectedProducts.entries());
      localStorage.setItem('selectedProducts', JSON.stringify(data));
      console.log('💾 נשמר ב-localStorage:', data.length, 'מוצרים');
    } catch (error) {
      console.error('❌ שגיאה בשמירה ל-localStorage:', error);
    }
  }

  /**
   * טעינה מ-localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('selectedProducts');
      if (saved) {
        const data = JSON.parse(saved);
        this.selectedProducts = new Map(data);
        console.log('📂 נטען מ-localStorage:', this.selectedProducts.size, 'מוצרים');
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינה מ-localStorage:', error);
    }
  }
}

// יצירת instance יחיד (Singleton)
const selectionService = new SelectionService();
export default selectionService;