import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, mean_absolute_error, r2_score
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.impute import SimpleImputer
import io

# Set page configuration
st.set_page_config(page_title="Universal AI Model Builder", layout="wide")

def get_pipeline(df, target_col, model):
    """
    Construct a scikit-learn pipeline with ColumnTransformer.
    """
    X = df.drop(columns=[target_col])
    
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Numeric transformer: Impute then Scale
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Categorical transformer: Impute then One-Hot Encode
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Combine transformers
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # Create the full pipeline
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', model)
    ])
    
    return clf, numeric_features, categorical_features

def plot_confusion_matrix(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    ax.set_title('Confusion Matrix')
    return fig

def main():
    st.title("🏗️  Smart Building AI Model Builder")
    st.markdown("---")
    
    # Sidebar
    st.sidebar.header("Settings")
    uploaded_file = st.sidebar.file_uploader("Upload your CSV dataset", type=["csv"])
    
    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            
            # 1. Dataset Preview
            st.header("1. Dataset Overview")
            col1, col2 = st.columns([2, 1])
            with col1:
                st.subheader("Data Preview")
                st.dataframe(df.head())
            with col2:
                st.subheader("Dataset Shape")
                st.write(f"Rows: {df.shape[0]}")
                st.write(f"Columns: {df.shape[1]}")
                
            # Column detection
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
            
            st.write(f"**Numeric Columns:** {', '.join(numeric_cols)}")
            st.write(f"**Categorical Columns:** {', '.join(categorical_cols)}")
            
            # 2. Target Selection
            st.header("2. Model Configuration")
            target_column = st.selectbox("Select Target Column", options=df.columns)
            
            # Reset state if target changes
            if "last_target" not in st.session_state or st.session_state["last_target"] != target_column:
                st.session_state["trained"] = False
                st.session_state["last_target"] = target_column
                if "results_df" in st.session_state:
                    del st.session_state["results_df"]
            
            # --- Automatic Task Detection ---
            is_numeric = np.issubdtype(df[target_column].dtype, np.number)
            unique_count = df[target_column].nunique()
            
            # If numeric and more than 10 unique values, suggest Regression. Else Classification.
            if is_numeric and unique_count > 10:
                task_type = "Regression"
                default_models = ["Random Forest Regressor", "Linear Regression", "Decision Tree Regressor", "Gradient Boosting Regressor", "KNN Regressor"]
            else:
                task_type = "Classification"
                default_models = ["Random Forest", "Decision Tree", "KNN", "Logistic Regression", "Gradient Boosting"]
            
            st.info(f"💡 Detected Task: **{task_type}** (Based on {unique_count} unique values in '{target_column}')")
            
            # Automated selection of algorithms
            if task_type == "Classification":
                models_to_try = {
                    "Random Forest": RandomForestClassifier(random_state=42),
                    "Decision Tree": DecisionTreeClassifier(random_state=42),
                    "KNN": KNeighborsClassifier(),
                    "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
                    "Gradient Boosting": GradientBoostingClassifier(random_state=42)
                }
            else:
                models_to_try = {
                    "Random Forest": RandomForestRegressor(random_state=42),
                    "Linear Regression": LinearRegression(),
                    "Decision Tree": DecisionTreeRegressor(random_state=42),
                    "Gradient Boosting": GradientBoostingRegressor(random_state=42),
                    "KNN": KNeighborsRegressor()
                }
            
            test_size = st.sidebar.slider("Test Set Size (%)", 10, 50, 20) / 100
            
            if st.button("🚀 Start Auto-AI Engine"):
                with st.spinner("Initializing models and evaluating performance..."):
                    try:
                        # Save task type
                        st.session_state['task_type'] = task_type
                        
                        # Handle missing values in target
                        df_clean = df.dropna(subset=[target_column])
                        if len(df_clean) < len(df):
                            st.warning(f"⚠️ Dropped {len(df) - len(df_clean)} rows with missing target values.")
                        
                        # Prepare data
                        X = df_clean.drop(columns=[target_column])
                        y = df_clean[target_column]
                        
                        # Encode target if Classification and categorical
                        target_le = None
                        if task_type == "Classification":
                            if y.dtype == 'object' or y.dtype.name == 'category':
                                target_le = LabelEncoder()
                                y = target_le.fit_transform(y.astype(str))
                        
                        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
                        
                        results = []
                        best_pipeline = None
                        best_score = -np.inf
                        best_model_name = ""
                        best_y_pred = None
                        num_feats, cat_feats = [], []

                        progress_bar = st.progress(0)
                        for idx, (name, base_model) in enumerate(models_to_try.items()):
                            # Build and Train Pipeline
                            pipeline, n_f, c_f = get_pipeline(df_clean, target_column, base_model)
                            num_feats, cat_feats = n_f, c_f # Store for later
                            
                            pipeline.fit(X_train, y_train)
                            y_pred = pipeline.predict(X_test)
                            
                            if task_type == "Classification":
                                score = accuracy_score(y_test, y_pred)
                                results.append({"Model": name, "Accuracy": score})
                            else:
                                score = r2_score(y_test, y_pred)
                                mae = mean_absolute_error(y_test, y_pred)
                                results.append({"Model": name, "R2 Score": score, "MAE": mae})
                            
                            if score > best_score:
                                best_score = score
                                best_pipeline = pipeline
                                best_model_name = name
                                best_y_pred = y_pred
                            
                            progress_bar.progress((idx + 1) / len(models_to_try))

                        # Save the best model
                        pipeline = best_pipeline
                        model_type = best_model_name
                        y_pred = best_y_pred
                        base_model = pipeline.named_steps['classifier']
                        
                        results_df = pd.DataFrame(results).sort_values(by=pd.DataFrame(results).columns[1], ascending=False)
                        
                        # Save everything to session state for persistence
                        st.session_state['results_df'] = results_df
                        st.session_state['best_model_name'] = model_type
                        st.session_state['best_score'] = best_score
                        st.session_state['best_y_pred'] = y_pred
                        st.session_state['y_test'] = y_test
                        st.session_state['pipeline'] = pipeline
                        st.session_state['target_le'] = target_le
                        st.session_state['original_dtypes'] = df.dtypes
                        st.session_state['feature_names'] = X.columns.tolist()
                        st.session_state['num_feats'] = num_feats
                        st.session_state['cat_feats'] = cat_feats
                        st.session_state['trained'] = True
                        
                        st.balloons()
                        st.rerun() # Refresh to show results outside the button block
                            
                    except Exception as e:
                        st.error(f"Error during training: {str(e)}")

            # --- Display Results (Persistent) ---
            if st.session_state.get('trained'):
                st.markdown("---")
                st.header("🏆 Auto-AI Leaderboard")
                results_df = st.session_state['results_df']
                st.table(results_df)
                
                metric_name = results_df.columns[1]
                st.success(f"Best Model Selected: **{st.session_state['best_model_name']}** with {metric_name}: {st.session_state['best_score']:.4f}")

                # 3. Results Section
                st.header("3. Evaluation Results")
                
                task_type = st.session_state['task_type']
                y_test = st.session_state['y_test']
                y_pred = st.session_state['best_y_pred']
                pipeline = st.session_state['pipeline']
                base_model = pipeline.named_steps['classifier']
                
                if task_type == "Classification":
                    acc = accuracy_score(y_test, y_pred)
                    st.success(f"Model Accuracy: {acc:.2%}")
                    res1, res2 = st.columns(2)
                    with res1:
                        st.subheader("Classification Report")
                        st.text(classification_report(y_test, y_pred))
                    with res2:
                        st.subheader("Confusion Matrix")
                        st.pyplot(plot_confusion_matrix(y_test, y_pred))
                else:
                    mae = mean_absolute_error(y_test, y_pred)
                    r2 = r2_score(y_test, y_pred)
                    st.success(f"Model R² Score: {r2:.4f}")
                    res1, res2 = st.columns(2)
                    with res1:
                        st.metric("Mean Absolute Error", f"{mae:.4f}")
                    with res2:
                        st.metric("R² Score", f"{r2:.4f}")
                        
                    # Scatter plot for Regression
                    st.subheader("Actual vs Predicted")
                    fig, ax = plt.subplots(figsize=(8, 5))
                    plt.scatter(y_test, y_pred, alpha=0.5)
                    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
                    plt.xlabel('Actual')
                    plt.ylabel('Predicted')
                    st.pyplot(fig)
                    
                # Feature Importance Visualization
                if hasattr(base_model, 'feature_importances_'):
                    try:
                        st.subheader("Feature Importance")
                        num_feats = st.session_state['num_feats']
                        cat_feats = st.session_state['cat_feats']
                        ohe = pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
                        cat_ohe_names = ohe.get_feature_names_out(cat_feats)
                        all_feature_names = num_feats + list(cat_ohe_names)
                        
                        feat_importances = pd.Series(base_model.feature_importances_, index=all_feature_names)
                        fig, ax = plt.subplots()
                        feat_importances.nlargest(10).plot(kind='barh', ax=ax)
                        st.pyplot(fig)
                    except:
                        st.info("Feature importance visualization not available for this model structure.")
                    
                # Saving Model
                model_filename = f"{st.session_state['best_model_name'].replace(' ', '_').lower()}_pipeline.joblib"
                joblib.dump(pipeline, model_filename)
                
                with open(model_filename, "rb") as f:
                    st.download_button("📥 Download Trained Pipeline", data=f, file_name=model_filename)

            # 4. Visualization Section
            if st.checkbox("Show Data Visualizations"):
                st.header("4. Visualizations")
                try:
                    v1, v2 = st.columns(2)
                    with v1:
                        st.subheader("Target Distribution")
                        fig, ax = plt.subplots()
                        df[target_column].value_counts().plot(kind='bar', ax=ax)
                        st.pyplot(fig)
                    with v2:
                        st.subheader("Correlation Heatmap")
                        fig, ax = plt.subplots(figsize=(10, 8))
                        # Only use numeric columns for correlation
                        numeric_df = df.select_dtypes(include=[np.number])
                        if not numeric_df.empty:
                            sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt='.2f', ax=ax)
                            st.pyplot(fig)
                        else:
                            st.warning("No numeric columns available for correlation heatmap.")
                except Exception as e:
                    st.warning(f"Could not generate visualizations: {e}")

            # 5. Prediction Section
            if st.session_state.get('trained'):
                st.header("5. Prediction")
                st.info("Enter feature values below to make a prediction.")
                
                input_data = {}
                cols = st.columns(3)
                
                feature_names = st.session_state['feature_names']
                original_dtypes = st.session_state['original_dtypes']
                
                # Use a cleaner way to get numeric/categorical inputs
                for i, col_name in enumerate(feature_names):
                    col_idx = i % 3
                    with cols[col_idx]:
                        if np.issubdtype(original_dtypes[col_name], np.number):
                            # Handle numeric input
                            default_val = float(df[col_name].median()) if not df[col_name].isnull().all() else 0.0
                            input_data[col_name] = st.number_input(f"{col_name}", value=default_val)
                        else:
                            # Handle categorical input
                            # Get unique values, filtering out nulls
                            valid_options = [str(x) for x in df[col_name].dropna().unique()]
                            if not valid_options:
                                valid_options = ["Unknown"]
                            input_data[col_name] = st.selectbox(f"{col_name}", options=valid_options)
                
                if st.button("🔮 Predict"):
                    try:
                        # Process input data
                        input_df = pd.DataFrame([input_data])[feature_names]
                        
                        # Use the pipeline to predict (it handles scaling and encoding)
                        pipeline = st.session_state['pipeline']
                        prediction = pipeline.predict(input_df)[0]
                        
                        # Reverse encode target
                        target_le = st.session_state['target_le']
                        final_pred = prediction
                        
                        # Only reverse encode if classification and target_le exists
                        if st.session_state.get('task_type') == "Classification" and target_le:
                            final_pred = target_le.inverse_transform([prediction])[0]
                        
                        if st.session_state.get('task_type') == "Classification":
                            st.success(f"### **Prediction Result:** {final_pred}")

                            # --- Add Smart Building Health Advisory ---
                            # Check if prediction is health-related
                            health_keywords_good = ['normal', 'healthy', 'good', 'optimal', 'pass', 'safe', 'clean']
                            health_keywords_bad = ['fault', 'fail', 'warning', 'critical', 'dirty', 'poor', 'danger', 'repair', 'maintenance']
                            
                            pred_str = str(final_pred).lower()
                            
                            if any(kw in pred_str for kw in health_keywords_good):
                                st.info("✅ **Building Health Status: OPTIMAL**\n\nThe building equipment is operating within safe parameters. No immediate action is required.")
                            elif any(kw in pred_str for kw in health_keywords_bad):
                                st.warning("⚠️ **Building Health Status: ATTENTION REQUIRED**\n\nPotential equipment issues detected. We recommend scheduling a maintenance check to prevent system failure.")
                            # ------------------------------------------
                        else:
                            st.success(f"### **Predicted Value:** {final_pred:.4f}")
                        
                        # If classification model has predict_proba
                        if st.session_state.get('task_type') == "Classification" and hasattr(pipeline, "predict_proba"):
                            probs = pipeline.predict_proba(input_df)[0]
                            st.write("**Prediction Probability:**")
                            labels = target_le.classes_ if target_le else range(len(probs))
                            prob_df = pd.DataFrame([probs], columns=labels)
                            st.dataframe(prob_df)

                    except Exception as e:
                        st.error(f"Error making prediction: {str(e)}")
                    
        except Exception as e:
            st.error(f"Error loading file: {str(e)}")
    else:
        st.info("Please upload a CSV file to get started.")

if __name__ == "__main__":
    main()
