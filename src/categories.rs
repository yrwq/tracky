use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};

use crate::AppState;

pub async fn add(State(state): State<AppState>, Json(data): Json<CategoryNew>) {
    state
        .client
        .from("categories")
        .insert(format!("[ {{ \"name\": \"{}\" }} ]", &data.name))
        .execute()
        .await
        .unwrap();
}

pub async fn delete(State(state): State<AppState>, Json(data): Json<CategoryNew>) {
    state
        .client
        .from("categories")
        .eq("name", &data.name)
        .delete()
        .execute()
        .await
        .unwrap();
}

pub async fn delete_id(State(state): State<AppState>, Json(data): Json<CategoryDel>) {
    state
        .client
        .from("categories")
        .eq("id", &data.id.to_string())
        .delete()
        .execute()
        .await
        .unwrap();
}

pub async fn list(State(state): State<AppState>) -> Json<serde_json::Value> {
    let cat = state
        .client
        .from("categories")
        .select("*")
        .execute()
        .await
        .unwrap();
    let cat_text = cat.text().await.unwrap();
    let cat_json: serde_json::Value = serde_json::from_str(cat_text.as_str()).unwrap();
    Json(cat_json)
}

/// define required fields for deleting a category
#[derive(Deserialize)]
pub struct CategoryDel {
    pub id: i32,
}

/// define required fields for creating a category
#[derive(Deserialize)]
pub struct CategoryNew {
    pub name: String,
}

/// define fields of category in the db
#[derive(Debug, Deserialize, Serialize)]
pub struct Category {
    pub id: i32,
    pub name: String,
}
