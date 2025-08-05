/// Mengambil waktu sekarang dalam nanodetik sejak UNIX epoch (IC native)
pub fn get_current_time() -> u64 {
    ic_cdk::api::time()
}

/// Mengubah timestamp nanodetik ke detik (u64)
pub fn timestamp_ns_to_secs(timestamp_ns: u64) -> u64 {
    timestamp_ns / 1_000_000_000
}

/// Mengubah timestamp nanodetik ke string (untuk dikirim ke frontend)
pub fn timestamp_ns_to_string(timestamp_ns: u64) -> String {
    timestamp_ns.to_string()
}

/// Format timestamp ke string tanggal (YYYY-MM-DD HH:MM:SS) - manual tanpa chrono
pub fn timestamp_to_date(timestamp_ns: u64) -> String {
    // Konversi ke detik
    let seconds = timestamp_ns / 1_000_000_000;
    // Kalkulasi manual (asumsi UTC, tidak leap year aware, cukup untuk display)
    let days = seconds / 86400;
    let years = 1970 + days / 365;
    let months = 1 + (days % 365) / 30;
    let day_of_month = 1 + (days % 365) % 30;
    let hours = (seconds % 86400) / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", years, months, day_of_month, hours, minutes, secs)
}

/// Validasi kode mata uang yang didukung
pub fn validate_currency(currency: &str) -> bool {
    matches!(currency, "IDR" | "USD" | "BTC" | "EUR" | "SGD")
}

/// Validasi prioritas goal
pub fn validate_priority(priority: &str) -> bool {
    matches!(priority, "low" | "medium" | "high")
}

/// Mendapatkan string "YYYY-MM" dari timestamp nanodetik (manual, tanpa chrono)
pub fn get_year_month(timestamp_ns: u64) -> String {
    // Konversi ke detik
    let seconds = timestamp_ns / 1_000_000_000;
    // Kalkulasi manual (asumsi UTC, tidak leap year aware, cukup untuk grouping bulanan)
    let days = seconds / 86400;
    let years = 1970 + days / 365;
    let months = 1 + (days % 365) / 30;
    format!("{:04}-{:02}", years, months)
}