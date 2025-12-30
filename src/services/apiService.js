// client/src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:7276/api';

// יצירת instance של axios עם הגדרות ברירת מחדל
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor לטיפול בשגיאות
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error);
    
    if (error.response) {
      // השרת החזיר תשובה עם קוד שגיאה
      throw new Error(error.response.data.message || 'שגיאה בשרת');
    } else if (error.request) {
      // הבקשה נשלחה אך לא התקבלה תשובה
      throw new Error('אין תקשורת עם השרת. ודא שהשרת רץ.');
    } else {
      // משהו קרה בהגדרת הבקשה
      throw new Error('שגיאה בשליחת הבקשה');
    }
  }
);

// ===== קטגוריות =====
export const getCategories = async () => {
  console.log('📥 שולח בקשה לשליפת קטגוריות...');
  const response = await api.get('/Category');
  console.log('✅ התקבלו קטגוריות:', response.data);
  return response.data;
};

export const addCategory = async (categoryDto) => {
  console.log('📤 שולח קטגוריה חדשה:', categoryDto);
  const response = await api.post('/Category', categoryDto);
  console.log('✅ קטגוריה נוצרה:', response.data);
  return response.data;
};

// ===== מוצרים =====
export const getProductsByCategory = async (categoryId) => {
  console.log(`📥 שולח בקשה לשליפת מוצרים לקטגוריה ${categoryId}...`);
  const response = await api.get(`/Category/${categoryId}/products`);
  console.log(`✅ התקבלו ${response.data.length} מוצרים`);
  return response.data;
};

export const getProductById = async (productId) => {
  console.log(`📥 שולח בקשה לשליפת מוצר ${productId}...`);
  const response = await api.get(`/Category/product/${productId}`);
  console.log('✅ מוצר התקבל:', response.data);
  return response.data;
};

export const addProduct = async (productDto) => {
  console.log('📤 שולח מוצר חדש:', productDto);
  const response = await api.post('/Category/product', productDto);
  console.log('✅ מוצר נוצר:', response.data);
  return response.data;
};

// ===== מתכונים =====
export const generateRecipe = async (recipeRequest) => {
  console.log('📤 שולח בקשה ליצירת מתכון:', recipeRequest);
  const response = await api.post('/Recipe/generate', recipeRequest);
  console.log('✅ מתכון נוצר:', response.data.title);
  return response.data;
};

// ===== מייל =====
export const sendEmail = async (emailData) => {
  console.log('📤 שולח מייל ל:', emailData.to);
  const response = await api.post('/Email/send', emailData);
  console.log('✅ המייל נשלח בהצלחה');
  return response.data;
};

export default api;