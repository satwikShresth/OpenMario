// components/Job/Form.tsx
import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import JobForm from '#/component/Job/Form';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import { useOcrJobStore } from '#/stores/useOcrJobStore';
import { type Position } from '#/utils/validators';
import type { Submission } from '#client/types.gen';

const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { submissions, addSubmission, updateSubmission } = useJobSubmissionStore();
  const { jobs } = useOcrJobStore();
  console.log(jobs)

  const submissionIndexParam = searchParams.get('submission');
  const ocrIndexParam = searchParams.get('ocr');

  const submissionIndex = submissionIndexParam ? parseInt(submissionIndexParam) : undefined;
  const ocrIndex = ocrIndexParam ? parseInt(ocrIndexParam) : undefined;
  console.log(ocrIndex)

  const submissionData = submissionIndex !== undefined ? submissions[submissionIndex] : undefined;
  const ocrData = ocrIndex !== undefined ? jobs[ocrIndex] : undefined;

  const formDefaultValues = useMemo(() => {
    const data = ocrData || submissionData;
    console.log(data)
    return {
      company: data?.company || '',
      position: data?.position || '',
      location: data?.location || '',
      program_level: data?.program_level || 'Undergraduate',
      work_hours: parseInt(data?.work_hours || "40"),
      coop_cycle: data?.coop_cycle || 'Fall/Winter',
      coop_year: data?.coop_year || '1st',
      year: data?.year || new Date().getFullYear(),
      compensation: parseFloat(data?.compensation || "10.00"),
      other_compensation: data?.other_compensation || '',
      details: `Employer ID: ${data?.employer_id || 'N/A'}, Position ID: ${data?.position_id || 'N/A'}, Job Length: ${data?.job_length || 'N/A'}, Coop Round: ${data?.coop_round || 'N/A'}`
    };
  }, [ocrData, submissionData]);

  const handleCancel = () => {
    navigate('/');
  };

  const handleSubmit = async (data: Position) => {
    submissionIndex
      && updateSubmission(submissionIndex, data as Submission)
      || addSubmission(data as Submission);
    navigate('/');
  };

  return (
    <>
      <JobForm
        editIndex={submissionIndex}
        formDefaultValues={formDefaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
};

export default FormPage;
