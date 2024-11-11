use crate::{auth, categories, services, AppState};
use axum::{
    middleware,
    routing::{get, post},
    Router,
};

pub async fn app(state: AppState) -> Router {
    Router::new()
        .route("/category/add", post(categories::add))
        .route("/category/list", get(categories::list))
        .route("/category/del", post(categories::delete))
        .route("/signin", post(auth::sign_in))
        .route(
            "/protected/",
            get(services::hello).layer(middleware::from_fn(auth::authorize)),
        )
        .with_state(state)
}
