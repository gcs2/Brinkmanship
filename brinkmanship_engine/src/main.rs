pub mod state;
pub mod chronos;

use crate::state::State;
use crate::chronos::{Chronos, ChronosEngine};

#[tokio::main]
async fn main() {
    println!("--- BRINKMANSHIP ENGINE: RUST COLD START ---");
    println!("Platform: Axum // ECS-Lite // Structural Sharing");
    
    // API routes and Axum server initialization will occur in Phase 0.4
}
