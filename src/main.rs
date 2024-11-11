mod auth;
mod categories;
mod routes;
mod services;

use dotenv::dotenv;
use postgrest::Postgrest;
use std::{borrow::Borrow, env::var};
use supabase_rs::SupabaseClient;

#[derive(Clone)]
struct AppState {
    client: Postgrest,
}

#[shuttle_runtime::main]
async fn main() -> shuttle_axum::ShuttleAxum {
    // load .env
    dotenv().ok();
    let url = var("SUPABASE_URL").unwrap();
    let key = var("SUPABASE_KEY").unwrap();
    let jwt = var("SUPABASE_JWT").unwrap();

    let client = Postgrest::new(&url)
        .insert_header("apikey", &key)
        .insert_header("Authorization", format!("Bearer {}", &key));

    let state = AppState { client };

    // let resp = client
    //     .from("categories")
    //     .select("*")
    //     .execute()
    //     .await
    //     .unwrap();
    // let body = resp.text().await.unwrap();

    // println!("{body:?}");

    let app = routes::app(state).await;
    Ok(app.clone().into())
}
