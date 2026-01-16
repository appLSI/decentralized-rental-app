import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest, f_regression

# --- ÉTAPE 1 : GÉNÉRATION DU DATASET SYNTHÉTIQUE ---
def generate_data(n_samples=1000):
    np.random.seed(42)
    data = {
        'property_id': range(1, n_samples + 1),
        'nb_of_guests': np.random.randint(1, 10, n_samples),
        'nb_of_bedrooms': np.random.randint(1, 5, n_samples),
        'nb_of_beds': np.random.randint(1, 8, n_samples),
        'nb_of_bathrooms': np.random.choice([1, 1.5, 2, 2.5, 3], n_samples),
        'country': np.random.choice(['France', 'Morocco', 'USA', 'Spain'], n_samples),
        'city': np.random.choice(['Paris', 'Marrakech', 'New York', 'Madrid', 'Lyon', 'Casablanca'], n_samples),
        'type': np.random.choice(['appartment', 'castle', 'hotel', 'house'], n_samples)
    }
    df = pd.DataFrame(data)
    
    # Calcul d'un prix réaliste avec un peu de bruit
    base_price = (df['nb_of_bedrooms'] * 40) + (df['nb_of_guests'] * 20)
    type_multiplier = df['type'].map({'castle': 5, 'hotel': 3, 'house': 1.5, 'appartment': 1})
    df['price'] = (base_price * type_multiplier) + np.random.normal(0, 15, n_samples)
    
    # Introduction volontaire de valeurs NULL pour le test
    for col in ['nb_of_bedrooms', 'nb_of_bathrooms', 'type']:
        df.loc[df.sample(frac=0.05).index, col] = np.nan
        
    return df

df = generate_data(2000)

# --- ÉTAPE 2 : PRÉPARATION ET PIPELINE DE PROCESSING ---

# On sépare la cible (Y) des variables explicatives (X)
# On retire 'property_id' car il n'a aucune valeur prédictive (Feature Selection manuelle)
X = df.drop(['price', 'property_id'], axis=1)
y = df['price'].fillna(df['price'].median()) # Sécurité pour la cible

# Définition des colonnes par type
numeric_features = ['nb_of_guests', 'nb_of_bedrooms', 'nb_of_beds', 'nb_of_bathrooms']
categorical_features = ['country', 'city', 'type']

# Pipeline pour les nombres : Imputation (remplace NULL par la médiane) + Standardisation
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

# Pipeline pour les catégories : Imputation (remplace NULL par 'missing') + OneHotEncoding
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combiner les deux transformations
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# --- ÉTAPE 3 : FEATURE SELECTION & ENTRAÎNEMENT ---

# Le pipeline complet inclut : Processing -> Sélection -> Modèle
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('feature_selection', SelectKBest(score_func=f_regression, k='all')), # 'all' car dataset petit
    ('regressor', GradientBoostingRegressor(
        n_estimators=200, 
        learning_rate=0.1, 
        max_depth=4, 
        random_state=42
    ))
])

# Split des données
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entraînement
model_pipeline.fit(X_train, y_train)

# Sauvegarde
joblib.dump(model_pipeline, 'optimized_price_model.joblib')
print(f"Modèle entraîné avec succès. Score R² : {model_pipeline.score(X_test, y_test):.4f}")