use anchor_lang::prelude::*;

declare_id!("SyMBi15mBdZFvgFjSJGnmVZWe2FsBM3VN47L6PemxGWy");

// ─── Events ────────────────────────────────────────────────────────────────

#[event]
pub struct BiologicalReading {
    pub subject_id: String,
    pub serotonin_nm: f64,
    pub dopamine_nm: f64,
    pub cortisol_nm: f64,
    pub gaba_nm: f64,
    pub anomaly_flag: bool,
    pub severity: String,    // "NONE" | "LOW" | "MEDIUM" | "HIGH"
    pub timestamp: i64,
}

// ─── Accounts ──────────────────────────────────────────────────────────────

#[account]
pub struct BiologicalRecord {
    pub authority: Pubkey,
    pub subject_id: String,    // max 64 bytes
    pub serotonin_nm: f64,
    pub dopamine_nm: f64,
    pub cortisol_nm: f64,
    pub gaba_nm: f64,
    pub anomaly_flag: bool,
    pub severity: String,      // max 8 bytes
    pub timestamp: i64,
    pub bump: u8,
}

impl BiologicalRecord {
    pub const LEN: usize = 8 + 32 + (4 + 64) + 8 + 8 + 8 + 8 + 1 + (4 + 8) + 8 + 1;
}

// ─── Error codes ───────────────────────────────────────────────────────────

#[error_code]
pub enum SymbionError {
    #[msg("Subject ID must not be empty")]
    EmptySubjectId,
    #[msg("Invalid severity: must be NONE, LOW, MEDIUM, or HIGH")]
    InvalidSeverity,
    #[msg("Biomarker value must be non-negative")]
    NegativeBiomarker,
    #[msg("Unauthorized: signer is not the record authority")]
    Unauthorized,
}

// ─── Program ───────────────────────────────────────────────────────────────

#[program]
pub mod symbion {
    use super::*;

    /// Initialize a biological monitoring record for a subject.
    pub fn register_subject(
        ctx: Context<RegisterSubject>,
        subject_id: String,
    ) -> Result<()> {
        require!(!subject_id.is_empty(), SymbionError::EmptySubjectId);

        let record = &mut ctx.accounts.bio_record;
        let clock = Clock::get()?;

        record.authority = ctx.accounts.authority.key();
        record.subject_id = subject_id;
        record.serotonin_nm = 0.0;
        record.dopamine_nm = 0.0;
        record.cortisol_nm = 0.0;
        record.gaba_nm = 0.0;
        record.anomaly_flag = false;
        record.severity = "NONE".to_string();
        record.timestamp = clock.unix_timestamp;
        record.bump = ctx.bumps.bio_record;

        Ok(())
    }

    /// Record a biological reading for a subject.
    /// Emits BiologicalReading so the ZWM indexer can detect anomalies.
    pub fn record_reading(
        ctx: Context<RecordReading>,
        serotonin_nm: f64,
        dopamine_nm: f64,
        cortisol_nm: f64,
        gaba_nm: f64,
        anomaly_flag: bool,
        severity: String,
    ) -> Result<()> {
        require!(serotonin_nm >= 0.0, SymbionError::NegativeBiomarker);
        require!(dopamine_nm >= 0.0, SymbionError::NegativeBiomarker);
        require!(cortisol_nm >= 0.0, SymbionError::NegativeBiomarker);
        require!(gaba_nm >= 0.0, SymbionError::NegativeBiomarker);
        require!(
            matches!(severity.as_str(), "NONE" | "LOW" | "MEDIUM" | "HIGH"),
            SymbionError::InvalidSeverity
        );

        let record = &mut ctx.accounts.bio_record;
        require!(record.authority == ctx.accounts.authority.key(), SymbionError::Unauthorized);

        let clock = Clock::get()?;
        let subject_id = record.subject_id.clone();

        record.serotonin_nm = serotonin_nm;
        record.dopamine_nm = dopamine_nm;
        record.cortisol_nm = cortisol_nm;
        record.gaba_nm = gaba_nm;
        record.anomaly_flag = anomaly_flag;
        record.severity = severity.clone();
        record.timestamp = clock.unix_timestamp;

        emit!(BiologicalReading {
            subject_id,
            serotonin_nm,
            dopamine_nm,
            cortisol_nm,
            gaba_nm,
            anomaly_flag,
            severity,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// ─── Instruction Contexts ──────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(subject_id: String)]
pub struct RegisterSubject<'info> {
    #[account(
        init,
        payer = authority,
        space = BiologicalRecord::LEN,
        seeds = [b"bio", subject_id.as_bytes()],
        bump,
    )]
    pub bio_record: Account<'info, BiologicalRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordReading<'info> {
    #[account(
        mut,
        seeds = [b"bio", bio_record.subject_id.as_bytes()],
        bump = bio_record.bump,
    )]
    pub bio_record: Account<'info, BiologicalRecord>,

    pub authority: Signer<'info>,
}
