# Analyse de la Structure des Composants - Fallout Shelter Save Editor

## 📋 Vue d'ensemble

L'application est une SPA (Single Page Application) React TypeScript permettant d'éditer les fichiers de sauvegarde du jeu Fallout Shelter. La structure suit un pattern classique avec une hiérarchie de composants bien organisée.

---

## 🏗️ Architecture générale

```
App.tsx (Racine)
├── Providers (React Query, Router, Tooltip)
└── Index.tsx (Page principale)
    ├── FileUpload.tsx (Upload de fichier)
    └── SaveEditor.tsx (Éditeur principal)
        ├── VaultEditor.tsx (Mode Vault - placeholder)
        └── CommonEditor.tsx (Éditeur standard)
            ├── DwellerEditor.tsx (Gestion des habitants)
            ├── ResourcesEditor.tsx (Gestion des ressources)
            ├── RecipesEditor.tsx (Gestion des recettes/items)
            └── RawJsonEditor.tsx (Éditeur JSON brut)
```

---

## 📦 Détail des composants

### **1. App.tsx** 
**Rôle:** Composant racine  
**Responsabilités:**
- Configuration des providers (QueryClient, Router, Tooltip)
- Setup du routeur (HashRouter pour mode SPA)
- Intégration des toasters (Sonner + ui/toaster)
- Route unique "/" vers Index, "*" vers NotFound

**Dépendances:** React Query, React Router, UI components

---

### **2. Index.tsx** (Page)
**Rôle:** Page principale - orchestration état global  
**Responsabilités:**
- Gestion de l'état des données de sauvegarde
- Basculement entre FileUpload et SaveEditor
- Gestion du localStorage (sauvegarde automatique)
- Callbacks pour chargement/retour

**Props acceptées:** Aucune  
**État local:**
- `saveData`: Données JSON de la sauvegarde
- `fileName`: Nom du fichier chargé

---

### **3. FileUpload.tsx**
**Rôle:** Interface de chargement de fichiers  
**Responsabilités:**
- Accepte fichiers .sav (chiffrés) ou .json
- Décryption via `decryptSave()` pour fichiers .sav
- Gestion du localStorage (sauvegarde dernière partie)
- Bouton de rechargement et suppression de dernière sauvegarde
- Gestion des erreurs (fichiers invalides, erreurs de déchiffrement)

**Props:**
```typescript
{
  onDataLoaded: (data: any, fileName: string) => void
}
```

**Features:**
- Affichage de la dernière partie chargée
- Zone d'upload (drag & drop)
- Gestion d'erreurs avec toast

---

### **4. SaveEditor.tsx**
**Rôle:** Composant principal d'édition  
**Responsabilités:**
- Affichage du fichier en cours d'édition
- Basculement entre mode Standard et mode Vault
- Export JSON ou .sav (chiffré)
- Navigation et gestion d'état global de l'éditeur

**Props:**
```typescript
{
  initialData: any,
  fileName: string,
  onBack: () => void
}
```

**État local:**
- `data`: Données en cours d'édition
- `isVaultMode`: Mode d'édition actif
- `saving`: État de téléchargement
- `open`: État du dialog d'export

**Features:**
- Affichage du nombre d'habitants
- Basculement Vault Mode ↔ Editor Mode
- Dialog d'export (2 formats)
- Gestion du chiffrement en temps réel

---

### **5. CommonEditor.tsx**
**Rôle:** Conteneur d'onglets pour l'édition standard  
**Responsabilités:**
- Navigation par onglets (Dwellers, Resources, Recipes, Raw)
- Routage vers les éditeurs spécialisés
- Gestion de l'onglet actif

**Props:**
```typescript
{
  data: any,
  setData: (data: any) => void
}
```

**Onglets disponibles:**
1. **DWELLERS** (Users icon) → DwellerEditor
2. **RESOURCES** (Package icon) → ResourcesEditor
3. **RECIPES** (FlaskConical icon) → RecipesEditor
4. **RAW** (Code icon) → RawJsonEditor

---

### **6. DwellerEditor.tsx** ⭐
**Rôle:** Éditeur des habitants (habitants du vault)  
**Responsabilités:**
- Affichage liste des habitants (personnages)
- Édition des stats SPECIAL (S, P, E, C, I, A, L)
- Gestion du niveau, expérience, santé
- Équipement (armes, tenues)
- Recherche et tri

**Features principales:**
- Recherche par nom
- Tri: par nom, niveau, ou stats individuelles
- Expansion/réduction par inhabitant
- Réinitialisation rapide (Reset Level 1)
- Affichage des stats avec icônes
- Gestion des armes et tenues (SELECT)

**État local:**
- `expandedId`: Inhabitant actuellement étendu
- `searchTerm`: Terme de recherche
- `sortBy`: Option de tri
- `sortDesc`: Direction du tri

---

### **7. ResourcesEditor.tsx**
**Rôle:** Éditeur des ressources du vault  
**Responsabilités:**
- Édition des ressources stockées
- Modification des quantités d'items

**Ressources gérées:**
- Caps (monnaie)
- Food (nourriture)
- Water (eau)
- Energy (électricité)
- Stimpaks (guérisons)
- RadAway (détoxification)
- Nuka Quantum (consommable spécial)
- Lunchbox (conteneur)
- Mr. Handy (robot)
- Pet Carrier (transporteur d'animaux)

**Interface:** Grid 2 colonnes avec inputs numériques

---

### **8. RecipesEditor.tsx**
**Rôle:** Gestion des recettes (items débloqués)  
**Responsabilités:**
- Affichage et édition des recettes obtenues/disponibles
- Gestion des armes, tenues, thèmes
- Détection d'IDs inconnus
- Toggle des éléments disponibles

**Onglets:**
- **WEAPONS**: Armes avec catégorisation
- **OUTFITS**: Tenues
- **THEMES**: Thèmes du vault
- **UNKNOWN**: IDs non reconnus dans items.json

**Features:**
- Checkboxes pour activer/désactiver recettes
- Support des variantes (armes par catégorie)
- Affichage détaillé avec stats

---

### **9. RawJsonEditor.tsx**
**Rôle:** Éditeur JSON brut/avancé  
**Responsabilités:**
- Édition en tant que structure JSON
- Exploration hiérarchique des données
- Édition de valeurs primitives

**Features:**
- Structure en arbre avec expansion/réduction
- Édition inline des valeurs
- Limite de profondeur (par défaut: 2)
- Support des arrays et objets
- Types reconnus: null, primitifs, objets, arrays

---

### **10. VaultEditor.tsx**
**Rôle:** Mode alternative (non implémenté)  
**Responsabilités:**
- Placeholder pour mode Vault (gestion visuelle du layout)
- Message "Coming soon"

**État:** Component stateless/placeholder

---

### **11. NavLink.tsx**
**Rôle:** Composant utilitaire pour navigation  
**Responsabilités:**
- Wrapper autour de React Router's NavLink
- Support des className personnalisées

---

## 🔄 Flux de données

```
FileUpload.tsx
    ↓ onDataLoaded(data, fileName)
Index.tsx (state: saveData, fileName)
    ↓ pass initialData, fileName
SaveEditor.tsx (state: data)
    ├─→ CommonEditor.tsx (state management)
    │   ├─→ DwellerEditor.tsx
    │   ├─→ ResourcesEditor.tsx
    │   ├─→ RecipesEditor.tsx
    │   └─→ RawJsonEditor.tsx
    └─→ VaultEditor.tsx
```

**Pattern:** 
- Props drilling (données passées en cascade)
- Callback lifting (modifications remontées)
- État local pour UI (expanded, sorted, etc.)

---

## 🎨 Design System

**Composants UI réutilisables** (dans `src/components/ui/`):
- Button, Input, Select, Checkbox
- Dialog, Tooltip
- Card, Badge
- Table, Tabs
- Toast, Toaster (Sonner)
- Et 30+ autres...

**Design tokens:**
- Classes Tailwind personnalisées
- `pip-text-glow`: Effet glow Fallout
- `scanline`: Effet CRT vintage
- `font-display`: Police spécialisée
- Thème sombre primaire

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Composants principaux** | 11 |
| **Composants UI** | 40+ |
| **Pages** | 2 (Index, NotFound) |
| **Onglets d'édition** | 4 |
| **Ressources gérées** | 10 |
| **Stats SPECIAL** | 7 |

---

## 🔧 Technologies utilisées

- **React** 18+ (Hooks: useState, useCallback)
- **TypeScript** 5+
- **React Router** (HashRouter)
- **React Query** (TanStack Query)
- **Tailwind CSS** 3+
- **Lucide React** (icônes)
- **Sonner** (toasts)
- **Custom Crypto** (chiffrement/déchiffrement)

---

## 🚀 Points clés d'architecture

1. **Séparation des responsabilités** ✅
   - Chaque éditeur specialisé gère son domaine
   - CommonEditor orchestre les onglets

2. **Réutilisabilité** ✅
   - Composants UI génériques
   - Hooks custom (use-toast, use-mobile)

3. **Performance** ✅
   - Callbacks memoizés (useCallback)
   - UseMemo pour ensembles de données

4. **Maintenabilité** ✅
   - Structure claire et prévisible
   - Nommage explicite des composants
   - Propriétés TypeScript bien typées

5. **Possibilités d'amélioration** 🔧
   - Context API ou Zustand pour réduire prop drilling
   - Chargement lazy des onglets
   - Tests unitaires

---

## 📝 Fichiers de données

- **`src/lib/gameData.ts`**: Constantes (armes, tenues, thèmes)
- **`src/lib/crypto.ts`**: Fonctions de chiffrement
- **`src/data/items.json`**: Base de données d'items

---

Cette architecture favorise la maintenabilité et la clarté du code tout en restant flexible pour les évolutions futures.

