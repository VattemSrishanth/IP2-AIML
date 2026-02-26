from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

def run_clustering_engine(df, features=['Hour', 'Energy', 'Occupancy']):
    """Run KMeans clustering for building usage patterns."""
    # Find columns if names differ slightly
    available_cols = df.columns.tolist()
    final_features = []
    
    for f in features:
        matches = [c for c in available_cols if f.lower() in c.lower()]
        if matches: final_features.append(matches[0])
        elif f in available_cols: final_features.append(f)
    
    if len(final_features) < 2:
        return {"error": "Insufficient features for clustering. Hour, Energy, Occupancy are required."}
    
    X = df[final_features].dropna()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Run KMeans with 4 clusters
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    # Interpretation of clusters
    df_result = X.copy()
    df_result['cluster'] = clusters
    cluster_stats = df_result.groupby('cluster').mean()
    
    # Assuming Energy is a key feature for identifying peak vs low
    energy_col = [c for c in final_features if 'energy' in c.lower()][0]
    sorted_clusters = cluster_stats[energy_col].sort_values().index.tolist()
    
    labels = {
        sorted_clusters[0]: "NIGHT MODE (Low Usage)",
        sorted_clusters[1]: "NORMAL OPERATION",
        sorted_clusters[2]: "PEAK LOAD",
        sorted_clusters[3]: "CRITICAL SPIKE / HIGH DEMAND"
    }
    
    interpretations = {}
    for cluster_id, label in labels.items():
        interpretations[int(cluster_id)] = {
            "label": label,
            "avg_energy": cluster_stats.loc[cluster_id, energy_col]
        }
        
    return {
        "clusters": clusters.tolist(),
        "interpretations": interpretations,
        "features": final_features
    }
