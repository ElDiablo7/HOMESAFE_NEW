/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GRACE-X Chef™ - Comprehensive Module V7
 * Fakeaways · Allergy Safety · Budget · Meal Plans · Pantry Mode · Savings Tracker
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * NON-NEGOTIABLE PRINCIPLES:
 * 1. Allergy safety FIRST (filter before suggestions)
 * 2. Doable > fancy (real kitchens, real time)
 * 3. No shame (no moralising food)
 * 4. Clear assumptions (prices are estimates)
 * 5. Kids safety when kidsPresent is true
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE KEYS
  // ═══════════════════════════════════════════════════════════════════════════
  const STORAGE_KEYS = {
    RECIPES: 'gracex_chef_recipes',
    SHOPPING: 'gracex_chef_shopping',
    MEALS: 'gracex_chef_meals',
    ALLERGIES: 'gracex_chef_allergies',
    PROFILE: 'gracex_chef_profile',
    SAVINGS: 'gracex_chef_savings',
    SUPERMARKETS: 'gracex_chef_supermarkets'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ALLERGY DATA (for filtering)
  // ═══════════════════════════════════════════════════════════════════════════
  const ALLERGY_INGREDIENTS = {
    nuts: ['almonds', 'cashews', 'walnuts', 'pecans', 'hazelnuts', 'pistachios', 'macadamia', 'brazil nuts', 'pine nuts', 'nut'],
    peanuts: ['peanuts', 'peanut butter', 'groundnuts'],
    dairy: ['milk', 'cheese', 'cream', 'butter', 'yoghurt', 'yogurt', 'parmesan', 'mozzarella', 'cheddar', 'paneer', 'ghee', 'cream cheese'],
    eggs: ['egg', 'eggs', 'mayo', 'mayonnaise'],
    gluten: ['flour', 'bread', 'pasta', 'spaghetti', 'noodles', 'breadcrumbs', 'tortilla', 'pita', 'couscous', 'batter'],
    shellfish: ['prawns', 'shrimp', 'crab', 'lobster', 'mussels', 'clams', 'scallops', 'oysters'],
    fish: ['cod', 'salmon', 'tuna', 'fish', 'anchovy', 'mackerel', 'fish sauce'],
    sesame: ['sesame', 'tahini', 'sesame oil'],
    soy: ['soy sauce', 'tofu', 'soya', 'edamame', 'miso'],
    celery: ['celery', 'celeriac']
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FAKEAWAY DATABASE (with costs)
  // ═══════════════════════════════════════════════════════════════════════════
  const FAKEAWAYS = {
    curry: [
      { 
        name: 'Chicken Tikka Masala', 
        time: 45, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['chicken breast', 'yoghurt', 'tikka spices', 'tomatoes', 'cream', 'onion', 'garlic', 'ginger', 'rice'],
        takeawayPrice: { min: 12, max: 16 },
        homemadePrice: { min: 4, max: 6 },
        healthierSwaps: ['Use Greek yoghurt instead of cream', 'More veg, less rice', 'Use chicken thighs for less fat'],
        allergens: ['dairy'],
        steps: ['Marinate chicken in spiced yoghurt', 'Fry onions until golden', 'Add spices and tomatoes', 'Simmer chicken in sauce', 'Finish with cream', 'Serve with rice']
      },
      { 
        name: 'Lamb Keema', 
        time: 30, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['lamb mince', 'peas', 'garam masala', 'onion', 'garlic', 'ginger', 'tomatoes', 'naan'],
        takeawayPrice: { min: 11, max: 15 },
        homemadePrice: { min: 5, max: 7 },
        healthierSwaps: ['Use lean mince or turkey mince', 'Add spinach', 'Serve with salad instead of naan'],
        allergens: ['gluten'],
        steps: ['Brown mince with onions', 'Add garlic and ginger', 'Stir in spices', 'Add tomatoes and peas', 'Simmer until thick', 'Serve with naan']
      },
      { 
        name: 'Butter Chicken', 
        time: 40, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['chicken', 'butter', 'tomato puree', 'cream', 'garam masala', 'fenugreek', 'onion', 'garlic'],
        takeawayPrice: { min: 13, max: 17 },
        homemadePrice: { min: 5, max: 7 },
        healthierSwaps: ['Reduce butter by half', 'Use coconut cream', 'Add peppers and spinach'],
        allergens: ['dairy'],
        steps: ['Marinate chicken', 'Make tomato-butter sauce', 'Cook chicken', 'Combine and simmer', 'Finish with cream']
      },
      { 
        name: 'Vegetable Biryani', 
        time: 50, 
        difficulty: 'medium', 
        servings: 4,
        ingredients: ['basmati rice', 'mixed veg', 'biryani spices', 'yoghurt', 'onion', 'saffron', 'mint'],
        takeawayPrice: { min: 10, max: 14 },
        homemadePrice: { min: 3, max: 5 },
        healthierSwaps: ['Add chickpeas for protein', 'Use brown rice', 'Double the vegetables'],
        allergens: ['dairy'],
        steps: ['Fry onions until crispy', 'Layer spiced veg and rice', 'Add saffron milk', 'Steam until cooked']
      }
    ],
    kebab: [
      { 
        name: 'Chicken Doner Kebab', 
        time: 35, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['chicken thighs', 'yoghurt', 'cumin', 'paprika', 'pita bread', 'lettuce', 'tomato', 'red onion', 'garlic sauce'],
        takeawayPrice: { min: 8, max: 12 },
        homemadePrice: { min: 3, max: 5 },
        healthierSwaps: ['Bake instead of fry', 'Wrap in lettuce not pita', 'Use tzatziki instead of garlic mayo'],
        allergens: ['gluten', 'dairy'],
        steps: ['Marinate chicken in spiced yoghurt', 'Grill or pan-fry until charred', 'Slice thinly', 'Warm pita', 'Assemble with salad and sauce']
      },
      { 
        name: 'Lamb Kofta Wrap', 
        time: 30, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['lamb mince', 'cumin', 'coriander', 'onion', 'flatbread', 'hummus', 'pickled cabbage', 'chilli sauce'],
        takeawayPrice: { min: 9, max: 13 },
        homemadePrice: { min: 4, max: 6 },
        healthierSwaps: ['Use lean lamb or beef', 'Grill instead of fry', 'Add more salad'],
        allergens: ['gluten', 'sesame'],
        steps: ['Mix mince with spices and onion', 'Shape into kofta', 'Grill until cooked', 'Warm flatbread', 'Assemble with hummus and salad']
      },
      { 
        name: 'Falafel Wrap', 
        time: 40, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['chickpeas', 'onion', 'garlic', 'cumin', 'coriander', 'flour', 'pita', 'tahini', 'salad'],
        takeawayPrice: { min: 7, max: 10 },
        homemadePrice: { min: 2, max: 4 },
        healthierSwaps: ['Bake falafel instead of frying', 'Use wholemeal pita', 'Extra salad'],
        allergens: ['gluten', 'sesame'],
        steps: ['Blend chickpeas with aromatics', 'Shape into balls', 'Fry or bake until crispy', 'Make tahini dressing', 'Assemble wraps']
      }
    ],
    chicken: [
      { 
        name: 'Crispy Chicken Strips', 
        time: 30, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['chicken breast', 'flour', 'eggs', 'breadcrumbs', 'paprika', 'garlic powder', 'oil'],
        takeawayPrice: { min: 8, max: 12 },
        homemadePrice: { min: 3, max: 5 },
        healthierSwaps: ['Air fry or oven bake', 'Use panko for less oil absorption', 'Serve with salad'],
        allergens: ['gluten', 'eggs'],
        steps: ['Slice chicken into strips', 'Season flour', 'Dip in egg then breadcrumbs', 'Fry until golden', 'Rest on paper towel']
      },
      { 
        name: 'Korean Fried Chicken', 
        time: 45, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['chicken wings', 'cornflour', 'gochujang', 'soy sauce', 'honey', 'garlic', 'sesame seeds', 'spring onions'],
        takeawayPrice: { min: 12, max: 16 },
        homemadePrice: { min: 5, max: 7 },
        healthierSwaps: ['Air fry the chicken', 'Use less sauce', 'Serve with pickled veg'],
        allergens: ['gluten', 'soy', 'sesame'],
        steps: ['Double-coat chicken in cornflour', 'Fry until extra crispy', 'Make gochujang glaze', 'Toss chicken in sauce', 'Garnish with sesame and spring onions']
      },
      { 
        name: 'Chicken Burger', 
        time: 25, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['chicken breast', 'flour', 'egg', 'breadcrumbs', 'brioche bun', 'lettuce', 'mayo', 'pickles'],
        takeawayPrice: { min: 9, max: 13 },
        homemadePrice: { min: 3, max: 5 },
        healthierSwaps: ['Grill instead of fry', 'Use wholemeal bun', 'Greek yoghurt instead of mayo'],
        allergens: ['gluten', 'eggs', 'dairy'],
        steps: ['Butterfly and flatten chicken', 'Bread the chicken', 'Fry until golden', 'Toast buns', 'Assemble burger']
      }
    ],
    burger: [
      { 
        name: 'Smash Burger', 
        time: 20, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['beef mince', 'burger buns', 'cheese', 'lettuce', 'tomato', 'pickles', 'onion', 'burger sauce'],
        takeawayPrice: { min: 10, max: 14 },
        homemadePrice: { min: 4, max: 6 },
        healthierSwaps: ['Use lean mince', 'Lettuce wrap instead of bun', 'Skip the cheese'],
        allergens: ['gluten', 'dairy'],
        steps: ['Form loose balls of mince', 'Smash flat on hot griddle', 'Season well', 'Add cheese to melt', 'Toast buns', 'Stack and serve']
      },
      { 
        name: 'BBQ Bacon Burger', 
        time: 25, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['beef mince', 'bacon', 'cheese', 'bbq sauce', 'brioche bun', 'onion rings', 'lettuce'],
        takeawayPrice: { min: 12, max: 16 },
        homemadePrice: { min: 5, max: 7 },
        healthierSwaps: ['Turkey bacon', 'Less sauce', 'No onion rings'],
        allergens: ['gluten', 'dairy'],
        steps: ['Form burger patties', 'Grill or fry bacon', 'Cook burgers', 'Toast buns', 'Layer with toppings']
      }
    ],
    pizza: [
      { 
        name: 'Margherita Pizza', 
        time: 30, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil', 'olive oil'],
        takeawayPrice: { min: 10, max: 14 },
        homemadePrice: { min: 3, max: 5 },
        healthierSwaps: ['Thin crust', 'Less cheese', 'Add vegetables'],
        allergens: ['gluten', 'dairy'],
        steps: ['Stretch dough', 'Spread sauce', 'Add torn mozzarella', 'Bake at highest heat', 'Top with fresh basil']
      },
      { 
        name: 'Pepperoni Pizza', 
        time: 30, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'pepperoni', 'oregano'],
        takeawayPrice: { min: 12, max: 16 },
        homemadePrice: { min: 4, max: 6 },
        healthierSwaps: ['Turkey pepperoni', 'Add mushrooms and peppers', 'Less cheese'],
        allergens: ['gluten', 'dairy'],
        steps: ['Stretch dough', 'Spread sauce', 'Add cheese', 'Layer pepperoni', 'Bake until bubbly']
      },
      { 
        name: 'BBQ Chicken Pizza', 
        time: 35, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['pizza dough', 'bbq sauce', 'chicken', 'mozzarella', 'red onion', 'coriander'],
        takeawayPrice: { min: 13, max: 17 },
        homemadePrice: { min: 5, max: 7 },
        healthierSwaps: ['Use less sauce', 'Add peppers', 'Thin crust base'],
        allergens: ['gluten', 'dairy'],
        steps: ['Pre-cook chicken', 'Spread BBQ sauce on base', 'Add cheese and chicken', 'Scatter onion', 'Bake and finish with coriander']
      }
    ],
    chinese: [
      { 
        name: 'Chicken Chow Mein', 
        time: 25, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['chicken breast', 'egg noodles', 'bean sprouts', 'spring onions', 'soy sauce', 'sesame oil', 'cabbage'],
        takeawayPrice: { min: 9, max: 13 },
        homemadePrice: { min: 3, max: 5 },
        healthierSwaps: ['More veg, less noodles', 'Low-sodium soy sauce', 'Add pak choi'],
        allergens: ['gluten', 'soy', 'sesame'],
        steps: ['Cook noodles', 'Stir-fry chicken', 'Add vegetables', 'Toss with noodles and sauce', 'Finish with spring onions']
      },
      { 
        name: 'Sweet & Sour Chicken', 
        time: 35, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['chicken breast', 'peppers', 'pineapple', 'vinegar', 'tomato ketchup', 'cornflour', 'rice'],
        takeawayPrice: { min: 10, max: 14 },
        homemadePrice: { min: 4, max: 6 },
        healthierSwaps: ['Bake chicken instead of frying', 'Less sugar in sauce', 'Extra peppers'],
        allergens: [],
        steps: ['Coat chicken in cornflour', 'Fry until crispy', 'Make sweet & sour sauce', 'Toss chicken with peppers and pineapple', 'Serve with rice']
      },
      { 
        name: 'Crispy Chilli Beef', 
        time: 40, 
        difficulty: 'medium', 
        servings: 2,
        ingredients: ['beef strips', 'cornflour', 'chilli flakes', 'honey', 'soy sauce', 'garlic', 'spring onions', 'sesame seeds'],
        takeawayPrice: { min: 11, max: 15 },
        homemadePrice: { min: 5, max: 7 },
        healthierSwaps: ['Use less oil for frying', 'Add broccoli', 'Reduce honey'],
        allergens: ['gluten', 'soy', 'sesame'],
        steps: ['Slice beef thin', 'Coat in cornflour', 'Deep fry until crispy', 'Make chilli glaze', 'Toss beef in sauce', 'Garnish']
      },
      { 
        name: 'Egg Fried Rice', 
        time: 15, 
        difficulty: 'easy', 
        servings: 2,
        ingredients: ['cooked rice', 'eggs', 'peas', 'spring onions', 'soy sauce', 'sesame oil'],
        takeawayPrice: { min: 5, max: 8 },
        homemadePrice: { min: 1, max: 2 },
        healthierSwaps: ['Use cauliflower rice', 'Add more veg', 'Less oil'],
        allergens: ['eggs', 'soy', 'sesame'],
        steps: ['Use cold day-old rice', 'Scramble eggs', 'Stir-fry rice at high heat', 'Add peas and spring onions', 'Season with soy sauce']
      }
    ]
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // QUICK DINNERS DATABASE
  // ═══════════════════════════════════════════════════════════════════════════
  const QUICK_DINNERS = [
    { name: 'Garlic Butter Pasta', time: 15, ingredients: ['pasta', 'garlic', 'butter', 'parmesan', 'herbs'], allergens: ['gluten', 'dairy'], icon: '🍝' },
    { name: 'Stir-Fry Veg & Noodles', time: 20, ingredients: ['noodles', 'mixed veg', 'soy sauce', 'ginger'], allergens: ['gluten', 'soy'], icon: '🥘' },
    { name: 'Loaded Omelette', time: 10, ingredients: ['eggs', 'cheese', 'leftover veg', 'herbs'], allergens: ['eggs', 'dairy'], icon: '🍳' },
    { name: 'Chicken Wraps', time: 25, ingredients: ['tortillas', 'chicken', 'salad', 'yoghurt sauce'], allergens: ['gluten', 'dairy'], icon: '🌯' },
    { name: 'Tuna Pasta Salad', time: 15, ingredients: ['pasta', 'tuna', 'sweetcorn', 'mayo', 'spring onions'], allergens: ['gluten', 'fish', 'eggs'], icon: '🥗' },
    { name: 'Bean Quesadillas', time: 15, ingredients: ['tortillas', 'black beans', 'cheese', 'salsa'], allergens: ['gluten', 'dairy'], icon: '🌮' },
    { name: 'Veggie Fried Rice', time: 20, ingredients: ['rice', 'eggs', 'mixed veg', 'soy sauce'], allergens: ['eggs', 'soy'], icon: '🍚' },
    { name: 'Soup & Toast', time: 15, ingredients: ['tinned soup', 'bread', 'butter', 'cheese'], allergens: ['gluten', 'dairy'], icon: '🍲' }
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let state = {
    recipes: [],
    shopping: [],
    meals: {},
    allergies: [],
    intolerances: [],
    dietType: 'none',
    supermarkets: ['tesco'],
    savings: {
      total: 0,
      history: [],
      enabled: true
    },
    currentRecipe: null
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  function init() {
    if (!document.getElementById("chef-stats-card")) {
      return;
    }

    console.log('[GRACE-X Chef] Initializing V7 with allergy safety...');

    loadState();
    checkKidsMode();
    initBrain();
    initAllergyTracker();
    initFakeawayGenerator();
    initPantryMode();
    initMealPlanner();
    initShoppingList();
    initSavingsTracker();
    initSupermarketDeals();

    updateDashboard();
    renderQuickDinners();
    renderMealPlanner();
    renderShoppingList();
    renderSavedRecipes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  function loadState() {
    try {
      state.recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES) || '[]');
      state.shopping = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOPPING) || '[]');
      state.meals = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEALS) || '{}');
      state.savings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS) || '{"total":0,"history":[],"enabled":true}');
      state.supermarkets = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPERMARKETS) || '["tesco"]');
      
      const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || '{}');
      state.allergies = profile.allergies || [];
      state.intolerances = profile.intolerances || [];
      state.dietType = profile.dietType || 'none';
    } catch (e) {
      console.warn('[Chef] Error loading state:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(state.recipes));
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(state.shopping));
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(state.meals));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(state.savings));
      localStorage.setItem(STORAGE_KEYS.SUPERMARKETS, JSON.stringify(state.supermarkets));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({
        allergies: state.allergies,
        intolerances: state.intolerances,
        dietType: state.dietType
      }));
    } catch (e) {
      console.warn('[Chef] Error saving state:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // KIDS MODE
  // ═══════════════════════════════════════════════════════════════════════════
  function checkKidsMode() {
    const kidsPresent = window.GRACEX_FLAGS?.kidsPresent || false;
    const banner = document.getElementById('chef-kids-banner');
    if (banner) {
      banner.style.display = kidsPresent ? 'flex' : 'none';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  function updateDashboard() {
    updateElement('chef-stat-recipes', state.recipes.length);
    updateElement('chef-stat-shopping', state.shopping.filter(s => !s.checked).length);
    updateElement('chef-stat-meals', Object.keys(state.meals).length);
    updateElement('chef-stat-savings', '£' + state.savings.total.toFixed(0));
    updateElement('chef-total-savings', '£' + state.savings.total.toFixed(2));
    updateElement('chef-fakeaways-count', state.savings.history.length);
    
    // Calculate weekly/monthly savings
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    const weekSavings = state.savings.history
      .filter(h => new Date(h.date) > weekAgo)
      .reduce((sum, h) => sum + h.saved, 0);
    const monthSavings = state.savings.history
      .filter(h => new Date(h.date) > monthAgo)
      .reduce((sum, h) => sum + h.saved, 0);
    
    updateElement('chef-savings-week', '£' + weekSavings.toFixed(2));
    updateElement('chef-savings-month', '£' + monthSavings.toFixed(2));
  }

  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAIN INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════
  function initBrain() {
    if (window.setupModuleBrain) {
      window.setupModuleBrain("chef", {
        panelId: "chef-brain-panel",
        inputId: "chef-brain-input",
        sendId: "chef-brain-send",
        outputId: "chef-brain-output",
        clearId: "chef-brain-clear",
        initialMessage: "Hey! I'm your kitchen companion. Ask me for recipes, fakeaway ideas, budget meals, or help with allergies. I'll keep things practical and safe!"
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ALLERGY TRACKER (SAFETY CRITICAL)
  // ═══════════════════════════════════════════════════════════════════════════
  function initAllergyTracker() {
    // Load saved allergies into UI
    document.querySelectorAll('[data-allergy]').forEach(el => {
      const allergy = el.dataset.allergy;
      el.checked = state.allergies.includes(allergy);
      el.addEventListener('change', () => {
        if (el.checked) {
          if (!state.allergies.includes(allergy)) state.allergies.push(allergy);
        } else {
          state.allergies = state.allergies.filter(a => a !== allergy);
        }
        updateAllergyStatus();
      });
    });

    // Intolerances
    document.querySelectorAll('[data-intolerance]').forEach(el => {
      const intolerance = el.dataset.intolerance;
      el.checked = state.intolerances.includes(intolerance);
      el.addEventListener('change', () => {
        if (el.checked) {
          if (!state.intolerances.includes(intolerance)) state.intolerances.push(intolerance);
        } else {
          state.intolerances = state.intolerances.filter(i => i !== intolerance);
        }
      });
    });

    // Diet type
    const dietSelect = document.getElementById('chef-diet-type');
    if (dietSelect) {
      dietSelect.value = state.dietType;
      dietSelect.addEventListener('change', () => {
        state.dietType = dietSelect.value;
      });
    }

    // Save button
    const saveBtn = document.getElementById('chef-allergy-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveState();
        renderQuickDinners(); // Re-render filtered list
        if (window.GXToast) GXToast.success('Profile Saved', 'Your allergy profile has been saved');
      });
    }

    updateAllergyStatus();
  }

  function updateAllergyStatus() {
    const statusEl = document.getElementById('chef-allergy-status');
    const countEl = statusEl?.querySelector('.chef-allergy-count');
    if (countEl) {
      const total = state.allergies.length + state.intolerances.length;
      countEl.textContent = `${total} ${total === 1 ? 'restriction' : 'restrictions'} active`;
    }
  }

  function filterRecipesByAllergies(recipes) {
    if (state.allergies.length === 0 && state.dietType === 'none') {
      return recipes;
    }

    return recipes.filter(recipe => {
      // Check allergens on recipe
      if (recipe.allergens) {
        for (const allergen of recipe.allergens) {
          if (state.allergies.includes(allergen)) {
            return false;
          }
        }
      }

      // Check ingredients against allergy ingredients list
      for (const allergy of state.allergies) {
        const badIngredients = ALLERGY_INGREDIENTS[allergy] || [];
        for (const ingredient of recipe.ingredients) {
          const lowerIng = ingredient.toLowerCase();
          if (badIngredients.some(bad => lowerIng.includes(bad))) {
            return false;
          }
        }
      }

      // Check diet type
      if (state.dietType === 'vegetarian' || state.dietType === 'vegan') {
        const meatWords = ['chicken', 'beef', 'pork', 'lamb', 'bacon', 'mince', 'fish', 'prawn', 'tuna', 'cod'];
        for (const ingredient of recipe.ingredients) {
          if (meatWords.some(meat => ingredient.toLowerCase().includes(meat))) {
            return false;
          }
        }
      }

      return true;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAKEAWAY GENERATOR (STAR FEATURE)
  // ═══════════════════════════════════════════════════════════════════════════
  function initFakeawayGenerator() {
    // Type buttons
    const typeButtons = document.querySelectorAll('.chef-fakeaway-type');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Generate button
    const generateBtn = document.getElementById('chef-generate-fakeaway');
    if (generateBtn) {
      generateBtn.addEventListener('click', generateFakeaway);
    }
  }

  function generateFakeaway() {
    const activeType = document.querySelector('.chef-fakeaway-type.active')?.dataset.type || 'any';
    const time = document.getElementById('chef-time')?.value || 'any';
    const servings = parseInt(document.getElementById('chef-servings')?.value || '2');
    const budget = document.getElementById('chef-budget')?.value || 'any';
    const healthier = document.getElementById('chef-healthier')?.checked || false;

    // Get all recipes of selected type
    let allRecipes = [];
    if (activeType === 'any') {
      Object.values(FAKEAWAYS).forEach(r => allRecipes.push(...r));
    } else {
      allRecipes = FAKEAWAYS[activeType] || [];
    }

    // Filter by allergies FIRST (safety)
    allRecipes = filterRecipesByAllergies(allRecipes);

    // Filter by time
    if (time !== 'any') {
      allRecipes = allRecipes.filter(r => {
        if (time === 'quick') return r.time <= 30;
        if (time === 'medium') return r.time > 30 && r.time <= 60;
        if (time === 'slow') return r.time > 60;
        return true;
      });
    }

    // Filter by budget
    if (budget !== 'any') {
      allRecipes = allRecipes.filter(r => {
        const costPerPortion = r.homemadePrice.max / r.servings;
        if (budget === 'cheap') return costPerPortion <= 3;
        if (budget === 'medium') return costPerPortion <= 5;
        return true;
      });
    }

    const outputDiv = document.getElementById('chef-fakeaway-output');
    
    if (allRecipes.length === 0) {
      outputDiv.style.display = 'block';
      outputDiv.innerHTML = `
        <div class="chef-no-results">
          <span>😔</span>
          <p>No recipes match your filters and allergy profile.</p>
          <p class="hint">Try adjusting your filters or check your allergy settings.</p>
        </div>
      `;
      return;
    }

    // Pick random recipe
    const recipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
    state.currentRecipe = recipe;

    // Calculate costs for servings
    const scaleFactor = servings / recipe.servings;
    const homemadeLow = (recipe.homemadePrice.min * scaleFactor).toFixed(2);
    const homemadeHigh = (recipe.homemadePrice.max * scaleFactor).toFixed(2);
    const takeawayLow = (recipe.takeawayPrice.min * scaleFactor).toFixed(2);
    const takeawayHigh = (recipe.takeawayPrice.max * scaleFactor).toFixed(2);
    const savedLow = (recipe.takeawayPrice.min - recipe.homemadePrice.max) * scaleFactor;
    const savedHigh = (recipe.takeawayPrice.max - recipe.homemadePrice.min) * scaleFactor;
    const savedMid = ((savedLow + savedHigh) / 2).toFixed(2);

    // Kids mode adjustments
    const kidsPresent = window.GRACEX_FLAGS?.kidsPresent || false;
    const stepsHtml = recipe.steps.map((step, i) => {
      let stepHtml = `<li>${step}</li>`;
      if (kidsPresent) {
        // Add safety notes for kids
        if (step.toLowerCase().includes('fry') || step.toLowerCase().includes('hot') || step.toLowerCase().includes('heat')) {
          stepHtml = `<li>${step} <span class="chef-kids-warning">⚠️ Adult help needed</span></li>`;
        }
        if (step.toLowerCase().includes('chop') || step.toLowerCase().includes('slice') || step.toLowerCase().includes('cut')) {
          stepHtml = `<li>${step} <span class="chef-kids-warning">⚠️ Sharp knife - adult only</span></li>`;
        }
      }
      return stepHtml;
    }).join('');

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = `
      <div class="chef-fakeaway-result-content">
        <h3>${recipe.name}</h3>
        
        <div class="chef-recipe-meta">
          <span class="gx-badge">⏱️ ${recipe.time} mins</span>
          <span class="gx-badge gx-badge-${recipe.difficulty === 'easy' ? 'success' : 'warning'}">${recipe.difficulty}</span>
          <span class="gx-badge">👥 ${servings} servings</span>
        </div>

        <div class="chef-cost-comparison">
          <div class="chef-cost-card chef-cost-takeaway">
            <span class="chef-cost-label">🛵 Takeaway</span>
            <span class="chef-cost-value">£${takeawayLow} - £${takeawayHigh}</span>
          </div>
          <div class="chef-cost-card chef-cost-homemade">
            <span class="chef-cost-label">🏠 Homemade</span>
            <span class="chef-cost-value">£${homemadeLow} - £${homemadeHigh}</span>
          </div>
          <div class="chef-cost-card chef-cost-saved">
            <span class="chef-cost-label">💰 You Save</span>
            <span class="chef-cost-value">~£${savedMid}</span>
          </div>
        </div>

        <div class="chef-ingredients">
          <h4>Ingredients</h4>
          <ul>
            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>

        <div class="chef-steps">
          <h4>Method</h4>
          <ol>
            ${stepsHtml}
          </ol>
        </div>

        ${healthier && recipe.healthierSwaps ? `
          <div class="chef-healthier-tips">
            <h4>🥗 Healthier Swaps</h4>
            <ul>
              ${recipe.healthierSwaps.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${state.allergies.length > 0 ? `
          <div class="chef-allergy-disclaimer chef-recipe-disclaimer">
            <strong>⚠️ Allergy Notice:</strong> Please double-check ingredient labels and cross-contamination risks — especially sauces, spice mixes, and pre-prepared foods.
          </div>
        ` : ''}

        <div class="chef-recipe-actions">
          <button class="builder-btn gx-btn-primary" id="chef-add-fakeaway-ingredients">
            🛒 Add to Shopping List
          </button>
          <button class="builder-btn" id="chef-save-fakeaway">
            💾 Save Recipe
          </button>
          <button class="builder-btn" id="chef-log-savings">
            💰 Log Savings (£${savedMid})
          </button>
        </div>
      </div>
    `;

    // Wire up buttons
    document.getElementById('chef-add-fakeaway-ingredients')?.addEventListener('click', () => {
      recipe.ingredients.forEach(ing => {
        if (!state.shopping.find(s => s.text.toLowerCase() === ing.toLowerCase())) {
          state.shopping.push({ id: Date.now() + Math.random(), text: ing, checked: false });
        }
      });
      saveState();
      renderShoppingList();
      updateDashboard();
      if (window.GXToast) GXToast.success('Added!', 'Ingredients added to shopping list');
    });

    document.getElementById('chef-save-fakeaway')?.addEventListener('click', () => {
      if (state.recipes.find(r => r.name === recipe.name)) {
        if (window.GXToast) GXToast.info('Already Saved', 'This recipe is already in your collection');
        return;
      }
      state.recipes.push({ ...recipe, savedDate: new Date().toISOString() });
      saveState();
      renderSavedRecipes();
      updateDashboard();
      if (window.GXToast) GXToast.success('Recipe Saved!', recipe.name);
    });

    document.getElementById('chef-log-savings')?.addEventListener('click', () => {
      if (!state.savings.enabled) {
        if (window.GXToast) GXToast.info('Tracking Disabled', 'Enable savings tracking to log this');
        return;
      }
      const saved = parseFloat(savedMid);
      state.savings.total += saved;
      state.savings.history.push({
        date: new Date().toISOString(),
        recipe: recipe.name,
        saved: saved
      });
      saveState();
      updateDashboard();
      if (window.GXToast) GXToast.success('Logged!', `£${savedMid} saved by cooking at home!`);
    });

    if (window.GXToast) {
      GXToast.success('🍳 Fakeaway Found!', recipe.name);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTRY MODE (What Can I Cook?)
  // ═══════════════════════════════════════════════════════════════════════════
  function initPantryMode() {
    const searchBtn = document.getElementById('chef-pantry-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', searchPantry);
    }
  }

  function searchPantry() {
    const ingredientsInput = document.getElementById('chef-pantry-ingredients')?.value || '';
    const expiringInput = document.getElementById('chef-pantry-expiring')?.value || '';
    
    const userIngredients = ingredientsInput.toLowerCase().split(',').map(i => i.trim()).filter(i => i);
    const expiringIngredients = expiringInput.toLowerCase().split(',').map(i => i.trim()).filter(i => i);

    const outputDiv = document.getElementById('chef-pantry-output');

    if (userIngredients.length === 0) {
      if (window.GXToast) GXToast.warning('Enter Ingredients', 'Tell us what you have');
      return;
    }

    // Get all recipes and filter by allergies
    let allRecipes = [];
    Object.values(FAKEAWAYS).forEach(r => allRecipes.push(...r));
    allRecipes = filterRecipesByAllergies(allRecipes);

    // Score recipes by ingredient match
    const matches = allRecipes.map(recipe => {
      const recipeIngs = recipe.ingredients.map(i => i.toLowerCase());
      
      // Count matches
      let matchCount = 0;
      let expiringMatchCount = 0;
      const missingIngredients = [];

      recipeIngs.forEach(ri => {
        const hasIt = userIngredients.some(ui => ri.includes(ui) || ui.includes(ri));
        if (hasIt) {
          matchCount++;
          // Bonus for using expiring ingredients
          if (expiringIngredients.some(ei => ri.includes(ei) || ei.includes(ri))) {
            expiringMatchCount++;
          }
        } else {
          missingIngredients.push(ri);
        }
      });

      const matchPercent = (matchCount / recipeIngs.length) * 100;
      const expiringBonus = expiringMatchCount * 20; // Bonus points for using expiring items
      
      return { 
        recipe, 
        matchCount, 
        matchPercent, 
        expiringBonus,
        totalScore: matchPercent + expiringBonus,
        missingIngredients
      };
    }).filter(m => m.matchCount > 0);

    if (matches.length === 0) {
      outputDiv.style.display = 'block';
      outputDiv.innerHTML = `
        <div class="chef-no-results">
          <span>😔</span>
          <p>No recipes match your ingredients and allergy profile.</p>
          <p class="hint">Try adding more ingredients or checking your pantry</p>
        </div>
      `;
      return;
    }

    // Get top 3 different types of suggestions
    const sortedByTime = [...matches].sort((a, b) => a.recipe.time - b.recipe.time);
    const sortedByHealthy = [...matches].sort((a, b) => {
      // Prefer recipes with healthier swaps listed
      return (b.recipe.healthierSwaps?.length || 0) - (a.recipe.healthierSwaps?.length || 0);
    });
    const sortedByScore = [...matches].sort((a, b) => b.totalScore - a.totalScore);

    const suggestions = [
      { label: '⚡ Fastest', match: sortedByTime[0], reason: `Only ${sortedByTime[0].recipe.time} mins` },
      { label: '🥗 Healthiest', match: sortedByHealthy[0], reason: 'Healthier option available' },
      { label: '🎯 Best Match', match: sortedByScore[0], reason: `${Math.round(sortedByScore[0].matchPercent)}% of ingredients` }
    ];

    // Remove duplicates
    const seen = new Set();
    const uniqueSuggestions = suggestions.filter(s => {
      if (seen.has(s.match.recipe.name)) return false;
      seen.add(s.match.recipe.name);
      return true;
    });

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = `
      <h4>You could make:</h4>
      <div class="chef-pantry-suggestions">
        ${uniqueSuggestions.map(s => `
          <div class="chef-pantry-suggestion">
            <div class="chef-pantry-suggestion-header">
              <span class="chef-pantry-label">${s.label}</span>
              <span class="chef-pantry-reason">${s.reason}</span>
            </div>
            <div class="chef-pantry-recipe">
              <strong>${s.match.recipe.name}</strong>
              <span class="gx-badge">⏱️ ${s.match.recipe.time} mins</span>
            </div>
            <div class="chef-pantry-missing">
              ${s.match.missingIngredients.length > 0 
                ? `<span class="hint">Missing: ${s.match.missingIngredients.join(', ')}</span>`
                : `<span class="hint" style="color: var(--gx-accent-green);">✓ You have everything!</span>`
              }
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="chef-pantry-more">
        <h5>Other options (${matches.length - uniqueSuggestions.length} more):</h5>
        <div class="chef-pantry-list">
          ${sortedByScore.slice(3, 8).map(m => `
            <div class="chef-pantry-item">
              <span>${m.recipe.name}</span>
              <span class="gx-badge gx-badge-${m.matchPercent > 70 ? 'success' : 'warning'}">${Math.round(m.matchPercent)}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.GXToast) GXToast.success('Found Recipes!', `${matches.length} options for your ingredients`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEAL PLANNER
  // ═══════════════════════════════════════════════════════════════════════════
  function initMealPlanner() {
    const generateBtn = document.getElementById('chef-generate-shopping');
    const clearBtn = document.getElementById('chef-clear-planner');
    const autoBtn = document.getElementById('chef-auto-plan');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        Object.values(state.meals).forEach(meal => {
          if (meal.ingredients) {
            meal.ingredients.forEach(ing => {
              if (!state.shopping.find(s => s.text.toLowerCase() === ing.toLowerCase())) {
                state.shopping.push({ id: Date.now() + Math.random(), text: ing, checked: false });
              }
            });
          }
        });
        saveState();
        renderShoppingList();
        updateDashboard();
        if (window.GXToast) GXToast.success('List Generated', 'Shopping list updated from meal plan');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all planned meals for this week?')) {
          state.meals = {};
          saveState();
          renderMealPlanner();
          updateDashboard();
        }
      });
    }

    if (autoBtn) {
      autoBtn.addEventListener('click', autoGenerateMealPlan);
    }
  }

  function autoGenerateMealPlan() {
    const planType = document.getElementById('chef-plan-type')?.value || 'custom';
    
    // Get all recipes filtered by allergies
    let allRecipes = [];
    Object.values(FAKEAWAYS).forEach(r => allRecipes.push(...r));
    allRecipes = filterRecipesByAllergies(allRecipes);

    if (allRecipes.length < 7) {
      if (window.GXToast) GXToast.warning('Not Enough Recipes', 'Not enough safe recipes for a full week');
      return;
    }

    // Filter by plan type
    if (planType === 'budget') {
      allRecipes = allRecipes.filter(r => r.homemadePrice.max <= 6);
    } else if (planType === 'family') {
      allRecipes = allRecipes.filter(r => r.difficulty === 'easy');
    } else if (planType === 'gym') {
      allRecipes = allRecipes.filter(r => 
        r.ingredients.some(i => ['chicken', 'beef', 'eggs', 'fish'].some(p => i.toLowerCase().includes(p)))
      );
    }

    // Shuffle and pick 7
    const shuffled = allRecipes.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 7);

    DAYS.forEach((day, i) => {
      if (selected[i]) {
        state.meals[day] = selected[i];
      }
    });

    saveState();
    renderMealPlanner();
    updateDashboard();
    if (window.GXToast) GXToast.success('Week Planned!', '7 meals generated based on your preferences');
  }

  function renderMealPlanner() {
    const grid = document.getElementById('chef-meal-grid');
    if (!grid) return;

    grid.innerHTML = DAYS.map(day => {
      const meal = state.meals[day];
      return `
        <div class="chef-meal-day" data-day="${day}">
          <div class="chef-meal-day-label">${day}</div>
          <div class="chef-meal-day-content">
            ${meal ? `
              <span class="chef-meal-name">${meal.name}</span>
              <span class="gx-badge">⏱️ ${meal.time}m</span>
              <button class="chef-meal-remove" data-action="remove" title="Remove">✕</button>
            ` : `
              <span class="chef-meal-empty">Click to add...</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    grid.querySelectorAll('[data-day]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'remove') {
          e.stopPropagation();
          const day = el.dataset.day;
          delete state.meals[day];
          saveState();
          renderMealPlanner();
          updateDashboard();
          return;
        }

        const day = el.dataset.day;
        showMealPicker(day);
      });
    });
  }

  function showMealPicker(day) {
    // Get filtered recipes
    let allRecipes = [];
    Object.values(FAKEAWAYS).forEach(r => allRecipes.push(...r));
    allRecipes = filterRecipesByAllergies(allRecipes);

    const modal = document.createElement('div');
    modal.className = 'chef-meal-picker-overlay';
    modal.innerHTML = `
      <div class="chef-meal-picker">
        <h3>Plan ${day}'s Meal</h3>
        <div class="chef-meal-picker-list">
          ${allRecipes.map((r, i) => `
            <div class="chef-meal-picker-item" data-index="${i}">
              <span>${r.name}</span>
              <span class="gx-badge">⏱️ ${r.time}m</span>
            </div>
          `).join('')}
        </div>
        <button class="builder-btn chef-meal-picker-close">Cancel</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.chef-meal-picker-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelectorAll('[data-index]').forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index);
        state.meals[day] = allRecipes[index];
        saveState();
        renderMealPlanner();
        updateDashboard();
        modal.remove();
        if (window.GXToast) GXToast.success('Meal Planned', `${allRecipes[index].name} for ${day}`);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOPPING LIST
  // ═══════════════════════════════════════════════════════════════════════════
  function initShoppingList() {
    const addBtn = document.getElementById('chef-shopping-add');
    const input = document.getElementById('chef-shopping-input');
    const clearCheckedBtn = document.getElementById('chef-shopping-clear-checked');
    const exportBtn = document.getElementById('chef-shopping-export');

    if (addBtn && input) {
      const addItem = () => {
        const text = input.value.trim();
        if (!text) return;
        state.shopping.push({ id: Date.now(), text, checked: false });
        saveState();
        renderShoppingList();
        updateDashboard();
        input.value = '';
      };

      addBtn.addEventListener('click', addItem);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addItem();
      });
    }

    if (clearCheckedBtn) {
      clearCheckedBtn.addEventListener('click', () => {
        state.shopping = state.shopping.filter(s => !s.checked);
        saveState();
        renderShoppingList();
        updateDashboard();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const list = state.shopping.map(s => `${s.checked ? '✓' : '○'} ${s.text}`).join('\n');
        const blob = new Blob([list], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping-list.txt';
        a.click();
        URL.revokeObjectURL(url);
        if (window.GXToast) GXToast.success('Exported', 'Shopping list downloaded');
      });
    }
  }

  function renderShoppingList() {
    const listEl = document.getElementById('chef-shopping-list');
    if (!listEl) return;

    if (state.shopping.length === 0) {
      listEl.innerHTML = `
        <div class="gx-empty-state" style="padding: 20px;">
          <div class="gx-empty-state-icon">🛒</div>
          <div class="gx-empty-state-message">Your shopping list is empty</div>
        </div>
      `;
      return;
    }

    // Estimate cost (very rough)
    const estimatedCost = state.shopping.filter(s => !s.checked).length * 1.50;
    updateElement('chef-shopping-cost', '£' + estimatedCost.toFixed(2));

    listEl.innerHTML = state.shopping.map(s => `
      <li class="gx-list-item ${s.checked ? 'completed' : ''}" data-id="${s.id}">
        <div class="gx-list-checkbox ${s.checked ? 'checked' : ''}" data-action="toggle"></div>
        <div class="gx-list-content" style="${s.checked ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
          ${s.text}
        </div>
        <button class="gx-btn gx-btn-icon gx-btn-ghost" data-action="delete">🗑️</button>
      </li>
    `).join('');

    // Event listeners
    listEl.querySelectorAll('[data-action="toggle"]').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.closest('.gx-list-item').dataset.id);
        const item = state.shopping.find(s => s.id === id);
        if (item) {
          item.checked = !item.checked;
          saveState();
          renderShoppingList();
          updateDashboard();
        }
      });
    });

    listEl.querySelectorAll('[data-action="delete"]').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.closest('.gx-list-item').dataset.id);
        state.shopping = state.shopping.filter(s => s.id !== id);
        saveState();
        renderShoppingList();
        updateDashboard();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVINGS TRACKER
  // ═══════════════════════════════════════════════════════════════════════════
  function initSavingsTracker() {
    const enabledToggle = document.getElementById('chef-savings-enabled');
    const resetBtn = document.getElementById('chef-savings-reset');
    const exportBtn = document.getElementById('chef-savings-export');

    if (enabledToggle) {
      enabledToggle.checked = state.savings.enabled;
      enabledToggle.addEventListener('change', () => {
        state.savings.enabled = enabledToggle.checked;
        saveState();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all savings data? This cannot be undone.')) {
          state.savings = { total: 0, history: [], enabled: true };
          saveState();
          updateDashboard();
          if (window.GXToast) GXToast.info('Reset', 'Savings tracker has been reset');
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = state.savings.history.map(h => 
          `${new Date(h.date).toLocaleDateString()} - ${h.recipe} - £${h.saved.toFixed(2)} saved`
        ).join('\n');
        const summary = `Total Saved: £${state.savings.total.toFixed(2)}\nFakeaways Made: ${state.savings.history.length}\n\n${data}`;
        
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chef-savings-history.txt';
        a.click();
        URL.revokeObjectURL(url);
        if (window.GXToast) GXToast.success('Exported', 'Savings history downloaded');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPERMARKET DEALS
  // ═══════════════════════════════════════════════════════════════════════════
  function initSupermarketDeals() {
    document.querySelectorAll('[data-store]').forEach(el => {
      const store = el.dataset.store;
      el.checked = state.supermarkets.includes(store);
      el.addEventListener('change', () => {
        if (el.checked) {
          if (!state.supermarkets.includes(store)) state.supermarkets.push(store);
        } else {
          state.supermarkets = state.supermarkets.filter(s => s !== store);
        }
        saveState();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUICK DINNERS
  // ═══════════════════════════════════════════════════════════════════════════
  function renderQuickDinners() {
    const listEl = document.getElementById('chef-quick-list');
    if (!listEl) return;

    // Filter quick dinners by allergies
    const filtered = QUICK_DINNERS.filter(dinner => {
      for (const allergen of dinner.allergens) {
        if (state.allergies.includes(allergen)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="gx-empty-state">
          <p>No quick dinners match your allergy profile</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(d => `
      <div class="gx-list-item">
        <span style="font-size: 1.25rem;">${d.icon}</span>
        <div class="gx-list-content">
          <strong>${d.name}</strong>
          <div style="font-size: 0.8rem; opacity: 0.7;">${d.ingredients.join(', ')}</div>
        </div>
        <span class="gx-badge gx-badge-success">${d.time} mins</span>
      </div>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVED RECIPES
  // ═══════════════════════════════════════════════════════════════════════════
  function renderSavedRecipes() {
    const listEl = document.getElementById('chef-saved-list');
    if (!listEl) return;

    if (state.recipes.length === 0) {
      listEl.innerHTML = `
        <div class="gx-empty-state" style="padding: 20px;">
          <div class="gx-empty-state-icon">📖</div>
          <div class="gx-empty-state-message">No saved recipes yet</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = state.recipes.map((r, i) => `
      <li class="gx-list-item" data-index="${i}">
        <div class="gx-list-content">
          <strong>${r.name}</strong>
          <div style="font-size: 0.8rem; opacity: 0.7;">
            ⏱️ ${r.time} mins · ${r.difficulty}
          </div>
        </div>
        <button class="gx-btn gx-btn-icon gx-btn-ghost" data-action="delete">🗑️</button>
      </li>
    `).join('');

    listEl.querySelectorAll('[data-action="delete"]').forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.closest('.gx-list-item').dataset.index);
        state.recipes.splice(index, 1);
        saveState();
        renderSavedRecipes();
        updateDashboard();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION HOOKS
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', init);

  document.addEventListener('gracex:module:loaded', (ev) => {
    if (ev.detail && (ev.detail.module === 'chef' || (ev.detail.url && ev.detail.url.includes('chef.html')))) {
      setTimeout(init, 50);
    }
  });

  // Check if already on chef page
  if (document.getElementById('chef-stats-card')) {
    setTimeout(init, 100);
  }

})();
