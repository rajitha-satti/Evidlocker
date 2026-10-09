import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User, CrimeCase, EvidenceItem, ModificationRequest, AuditEntry } from '../types';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY &&
    !SUPABASE_URL.includes('your-project-ref') &&
    !SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase-service-role-key')
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'SUPABASE_CONFIGURATION_ERROR: Supabase URL and Service Role Key are not configured in environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

// -------------------------------------------------------------
// Database Mappers: PostgreSQL snake_case <-> TypeScript models
// -------------------------------------------------------------

export function mapDbUserToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    badgeNumber: row.badge_number,
    role: row.role,
    email: row.email,
    department: row.department,
    avatarUrl: row.avatar_url || undefined,
    status: row.status,
    fingerprintEnrolled: Boolean(row.fingerprint_enrolled),
    biometricKeyId: row.biometric_key_id || undefined,
    fingerprintHash: row.fingerprint_hash || undefined,
    webauthnCredentialId: row.webauthn_credential_id || undefined,
  };
}

export function mapUserToDbUser(user: User): any {
  return {
    id: user.id,
    name: user.name,
    badge_number: user.badgeNumber,
    role: user.role,
    email: user.email,
    department: user.department,
    avatar_url: user.avatarUrl || null,
    status: user.status,
    fingerprint_enrolled: Boolean(user.fingerprintEnrolled),
    biometric_key_id: user.biometricKeyId || null,
    fingerprint_hash: user.fingerprintHash || null,
    webauthn_credential_id: user.webauthnCredentialId || null,
    updated_at: new Date().toISOString(),
  };
}

export function mapDbCaseToCase(row: any): CrimeCase {
  return {
    id: row.id,
    title: row.title,
    crimeLocation: row.crime_location,
    openedDate: row.opened_date,
    status: row.status,
    leadInvestigator: {
      id: row.lead_investigator_id || '',
      name: row.lead_investigator_name,
      badgeNumber: row.lead_investigator_badge,
    },
    description: row.description || '',
    evidenceCount: Number(row.evidence_count || 0),
    isDemo: Boolean(row.is_demo),
  };
}

export function mapCaseToDbCase(item: CrimeCase): any {
  return {
    id: item.id,
    title: item.title,
    crime_location: item.crimeLocation,
    opened_date: item.openedDate,
    status: item.status,
    lead_investigator_id: item.leadInvestigator.id || null,
    lead_investigator_name: item.leadInvestigator.name,
    lead_investigator_badge: item.leadInvestigator.badgeNumber,
    description: item.description,
    evidence_count: item.evidenceCount,
    is_demo: Boolean(item.isDemo),
    updated_at: new Date().toISOString(),
  };
}

export function mapDbEvidenceToEvidence(row: any): EvidenceItem {
  return {
    id: row.id,
    caseId: row.case_id,
    name: row.name,
    evidenceType: row.evidence_type,
    description: row.description,
    collectionTimestamp: row.collection_timestamp,
    collectionLocation: {
      address: row.collection_address,
      roomOrSector: row.room_or_sector || undefined,
      coordinates: row.coordinates || undefined,
    },
    collectingOfficer: {
      id: row.collecting_officer_id || '',
      name: row.collecting_officer_name,
      badgeNumber: row.collecting_officer_badge,
      department: row.collecting_officer_department,
    },
    currentCustodian: row.current_custodian,
    currentStatus: row.current_status,
    storageLocation: row.storage_location,
    imageUrl: row.image_url || undefined,
    fileHash: row.file_hash || undefined,
    recordHash: row.record_hash,
    version: Number(row.version || 1),
    qrPayload: row.qr_payload,
    isDemo: Boolean(row.is_demo),
  };
}

export function mapEvidenceToDbEvidence(item: EvidenceItem, storagePath?: string): any {
  return {
    id: item.id,
    case_id: item.caseId,
    name: item.name,
    evidence_type: item.evidenceType,
    description: item.description,
    collection_timestamp: item.collectionTimestamp,
    collection_address: item.collectionLocation.address,
    room_or_sector: item.collectionLocation.roomOrSector || null,
    coordinates: item.collectionLocation.coordinates || null,
    collecting_officer_id: item.collectingOfficer.id || null,
    collecting_officer_name: item.collectingOfficer.name,
    collecting_officer_badge: item.collectingOfficer.badgeNumber,
    collecting_officer_department: item.collectingOfficer.department,
    current_custodian: item.currentCustodian,
    current_status: item.currentStatus,
    storage_location: item.storageLocation,
    image_url: item.imageUrl || null,
    storage_path: storagePath || null,
    file_hash: item.fileHash || null,
    record_hash: item.recordHash,
    version: item.version,
    qr_payload: item.qrPayload,
    is_demo: Boolean(item.isDemo),
    updated_at: new Date().toISOString(),
  };
}

export function mapDbModToMod(row: any): ModificationRequest {
  return {
    id: row.id,
    evidenceId: row.evidence_id,
    caseId: row.case_id,
    requestedBy: {
      id: row.requested_by_id || '',
      name: row.requested_by_name,
      badgeNumber: row.requested_by_badge,
      role: row.requested_by_role,
    },
    requestTimestamp: row.request_timestamp,
    fieldToChange: row.field_to_change,
    fieldNameDisplay: row.field_name_display,
    originalValue: row.original_value,
    requestedValue: row.requested_value,
    reason: row.reason,
    status: row.status,
    reviewedBy: row.reviewed_by_name
      ? {
          id: row.reviewed_by_id || '',
          name: row.reviewed_by_name,
          badgeNumber: row.reviewed_by_badge || '',
          role: row.reviewed_by_role || 'HIGHER_OFFICIAL',
        }
      : undefined,
    reviewTimestamp: row.review_timestamp || undefined,
    reviewNotes: row.review_notes || undefined,
  };
}

export function mapModToDbMod(mod: ModificationRequest): any {
  return {
    id: mod.id,
    evidence_id: mod.evidenceId,
    case_id: mod.caseId,
    requested_by_id: mod.requestedBy.id || null,
    requested_by_name: mod.requestedBy.name,
    requested_by_badge: mod.requestedBy.badgeNumber,
    requested_by_role: mod.requestedBy.role,
    request_timestamp: mod.requestTimestamp,
    field_to_change: mod.fieldToChange,
    field_name_display: mod.fieldNameDisplay,
    original_value: mod.originalValue,
    requested_value: mod.requestedValue,
    reason: mod.reason,
    status: mod.status,
    reviewed_by_id: mod.reviewedBy?.id || null,
    reviewed_by_name: mod.reviewedBy?.name || null,
    reviewed_by_badge: mod.reviewedBy?.badgeNumber || null,
    reviewed_by_role: mod.reviewedBy?.role || null,
    review_timestamp: mod.reviewTimestamp || null,
    review_notes: mod.reviewNotes || null,
    biometric_verification_used: false,
  };
}

export function mapDbAuditToAudit(row: any): AuditEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    action: row.action,
    evidenceId: row.evidence_id || undefined,
    caseId: row.case_id || undefined,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role,
    badgeNumber: row.badge_number,
    description: row.description,
    metadata: row.metadata || undefined,
    previousHash: row.previous_hash,
    hash: row.hash,
  };
}

export function mapAuditToDbAudit(entry: AuditEntry): any {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    action: entry.action,
    evidence_id: entry.evidenceId || null,
    case_id: entry.caseId || null,
    user_id: entry.userId,
    user_name: entry.userName,
    user_role: entry.userRole,
    badge_number: entry.badgeNumber,
    description: entry.description,
    metadata: entry.metadata || {},
    previous_hash: entry.previousHash,
    hash: entry.hash,
  };
}

// -------------------------------------------------------------
// Storage Helper: Upload to 'evidence-images' bucket
// -------------------------------------------------------------

export async function uploadEvidenceImage(
  evidenceId: string,
  base64DataUrl: string
): Promise<{ storagePath: string; signedUrl: string } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseClient();
    const matches = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      return null;
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Limit image size to 20MB
    if (buffer.length > 20 * 1024 * 1024) {
      throw new Error('Image exceeds 20MB limit.');
    }

    const ext = mimeType.split('/')[1] || 'jpeg';
    const storagePath = `evidence/${evidenceId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('evidence-images')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.warn('[Supabase Storage] Upload error:', uploadError.message);
      return null;
    }

    // Generate short-lived signed URL (valid for 24 hours = 86400 seconds)
    const { data: signedData, error: signError } = await supabase.storage
      .from('evidence-images')
      .createSignedUrl(storagePath, 86400);

    if (signError || !signedData?.signedUrl) {
      return { storagePath, signedUrl: base64DataUrl };
    }

    return { storagePath, signedUrl: signedData.signedUrl };
  } catch (err) {
    console.warn('[Supabase Storage] Error handling upload:', err);
    return null;
  }
}
