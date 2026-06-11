import { Certificate, Language } from '../types';
import { downloadCertificatePdf as generateCertificatePdf } from '../utils/certificates';
import { supabase, supabaseConfigError } from './supabaseClient';

type CertificateRow = {
  id?: string;
  application_id?: string;
  user_id?: string;
  opportunity_id?: string;
  organization_id?: string;
  certificate_number: string;
  volunteer_name: string;
  organization_name: string;
  opportunity_title: string;
  city: string;
  volunteer_hours: number;
  issued_at: string;
  certificate_url?: string | null;
};

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

function mapCertificate(row: CertificateRow): Certificate {
  return {
    id: row.id ?? row.certificate_number,
    applicationId: row.application_id ?? '',
    userId: row.user_id ?? '',
    opportunityId: row.opportunity_id ?? '',
    organizationId: row.organization_id ?? '',
    certificateNumber: row.certificate_number,
    volunteerName: row.volunteer_name,
    organizationName: row.organization_name,
    opportunityTitle: { en: row.opportunity_title, ru: row.opportunity_title },
    city: row.city,
    volunteerHours: row.volunteer_hours,
    issuedAt: row.issued_at,
    certificateUrl: row.certificate_url || undefined,
  };
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  const client = requireSupabase();
  const { data, error } = await client.from('certificates').select('*').eq('user_id', userId).order('issued_at', { ascending: false });
  if (error) throw new Error(`Failed to load certificates: ${error.message}`);
  return (data ?? []).map((row) => mapCertificate(row as CertificateRow));
}

export async function getCertificateByNumber(certificateNumber: string): Promise<Certificate | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('verify_certificate', { search_certificate_number: certificateNumber.trim().toUpperCase() });
  if (error) throw new Error(`Failed to verify certificate: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return row ? mapCertificate(row as CertificateRow) : null;
}

export async function createCertificateForCompletedApplication(applicationId: string): Promise<Certificate> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('issue_certificate_for_application', { p_application_id: applicationId });
  if (error) throw new Error(`Failed to issue certificate: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Certificate issuance returned no certificate.');
  return mapCertificate(row as CertificateRow);
}

export function downloadCertificatePdf(certificate: Certificate, language: Language) {
  return generateCertificatePdf(certificate, language);
}
