use axum::{
    body::Body,
    extract::{Json, Request, State},
    http::{self, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::AppState;

#[derive(Serialize, Deserialize)]
pub struct Cliams {
    pub exp: usize,
    pub iat: usize,
    pub email: String,
}

pub struct AuthError {
    message: String,
    status_code: StatusCode,
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    let hash = hash(password, DEFAULT_COST)?;
    Ok(hash)
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response<Body> {
        let body = Json(json!({
            "error": self.message,
        }));

        (self.status_code, body).into_response()
    }
}

pub fn encode_jwt(email: String) -> Result<String, StatusCode> {
    let jwt_token: String = "randomstring".to_string();

    let now = Utc::now();
    let expire: chrono::TimeDelta = Duration::hours(24);
    let exp: usize = (now + expire).timestamp() as usize;
    let iat: usize = now.timestamp() as usize;

    let claim = Cliams { iat, exp, email };
    let secret = jwt_token.clone();

    encode(
        &Header::default(),
        &claim,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

pub fn decode_jwt(jwt: String) -> Result<TokenData<Cliams>, StatusCode> {
    let secret = "randomstring".to_string();

    let result: Result<TokenData<Cliams>, StatusCode> = decode(
        &jwt,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR);
    result
}

#[derive(Clone)]
pub struct CurrentUser {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub password_hash: String,
}

pub async fn authorize(mut req: Request, next: Next) -> Result<Response<Body>, AuthError> {
    let auth_header = req.headers_mut().get(http::header::AUTHORIZATION);

    let auth_header = match auth_header {
        Some(header) => header.to_str().map_err(|_| AuthError {
            message: "Empty header is not allowed".to_string(),
            status_code: StatusCode::FORBIDDEN,
        })?,
        None => {
            return Err(AuthError {
                message: "Please add the JWT token to the header".to_string(),
                status_code: StatusCode::FORBIDDEN,
            })
        }
    };

    let mut header = auth_header.split_whitespace();

    let (bearer, token) = (header.next(), header.next());

    let token_data = match decode_jwt(token.unwrap().to_string()) {
        Ok(data) => data,
        Err(_) => {
            return Err(AuthError {
                message: "Unable to decode token".to_string(),
                status_code: StatusCode::UNAUTHORIZED,
            })
        }
    };

    // Fetch the user details from the database
    let current_user = match retrieve_user_by_email(&token_data.claims.email) {
        Some(user) => user,
        None => {
            return Err(AuthError {
                message: "You are not an authorized user".to_string(),
                status_code: StatusCode::UNAUTHORIZED,
            })
        }
    };

    req.extensions_mut().insert(current_user);
    Ok(next.run(req).await)
}

#[derive(Deserialize)]
pub struct SignInData {
    pub email: String,
    pub password: String,
}

pub async fn sign_in(Json(user_data): Json<SignInData>) -> Result<Json<String>, StatusCode> {
    println!("{:?}", hash(&user_data.password, DEFAULT_COST).unwrap());
    // retrieve user from the database
    let user = match retrieve_user_by_email(&user_data.email) {
        Some(user) => user,
        // not found
        None => return Err(StatusCode::UNAUTHORIZED),
    };

    // compare hash and pw
    if !verify_password(&user_data.password, &user.password_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    // handle bcrypt errors
    {
        // wrong pw
        return Err(StatusCode::UNAUTHORIZED);
    }

    // gen jwt
    let token = encode_jwt(user.email).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(token))
}

#[derive(Deserialize)]
pub struct RegisterData {
    pub email: String,
    pub password: String,
}

pub async fn register(State(state): State<AppState>, Json(data): Json<RegisterData>) {}

fn retrieve_user_by_email(email: &str) -> Option<CurrentUser> {
    let current_user: CurrentUser = CurrentUser {
        email: email.to_string(),
        first_name: " ".to_string(),
        last_name: " ".to_string(),
        password_hash: "$2b$12$OJrsURgS.Xm9LeEFC9rnfui4ZN.4M4/..ZlFONfvQqS94MirBrL9y".to_string(),
    };
    Some(current_user)
}
