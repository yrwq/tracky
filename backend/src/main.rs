use postgrest::Postgrest;

use anyhow::{Error, Result};

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenvy::dotenv()?;

    let client = Postgrest::new("https://huhbkrmghhjzicglibsx.supabase.co")
        .insert_header("apikey", std::env::var("SUPABASE_API_KEY").unwrap());
    // let resp = client.from("todos").select("*").execute().await?;
    let resp = client
        .from("categories")
        .insert(r#"[ { "id: 2, "name": "some" } ]"#)
        .execute()
        .await?;

    println!("{}", resp.text().await?);
    Ok(())
}
