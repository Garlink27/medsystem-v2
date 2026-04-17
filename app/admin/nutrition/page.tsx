import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminNutritionPage() {
  const [profiles, plans, followUps, discharges] = await Promise.all([
    db.execute({
      sql: `SELECT np.*, u.firstName || ' ' || u.lastName AS patientName
            FROM   NutritionalProfiles np
            JOIN   Users u ON u.userId = np.patientId
            ORDER  BY np.profileId`,
      args: [],
    }),
    db.execute({
      sql: `SELECT np.planId, np.patientId, np.nutritionistId, np.caloricRequirement, np.macrosDistribution,
                   np.weeklyMenu, np.equivalencesList, np.generalRecommendations, np.pdfUrl,
                   np.patientAccepted, np.creationDate,
                   pu.firstName || ' ' || pu.lastName AS patientName,
                   nu.firstName || ' ' || nu.lastName AS nutritionistName
            FROM   NutritionalPlans np
            JOIN   Users pu ON pu.userId = np.patientId
            JOIN   Users nu ON nu.userId = np.nutritionistId
            ORDER  BY np.planId`,
      args: [],
    }),
    db.execute({
      sql: `SELECT nf.followUpId, nf.planId, nf.consultationId, nf.currentWeight, nf.currentBmi,
                   nf.bodyMeasurements, nf.compliancePercentage, nf.adjustmentsMade, nf.newGoals, nf.followUpDate,
                   np.patientId
            FROM   NutritionalFollowUps nf
            JOIN   NutritionalPlans np ON np.planId = nf.planId
            ORDER  BY nf.followUpId`,
      args: [],
    }),
    db.execute({
      sql: `SELECT nd.dischargeId, nd.planId, nd.goalReached, nd.targetWeightAchieved,
                   nd.treatmentDurationDays, nd.maintenanceRecommendations, nd.dischargeReason, nd.dischargeDate,
                   np.patientId
            FROM   NutritionalDischarges nd
            JOIN   NutritionalPlans np ON np.planId = nd.planId
            ORDER  BY nd.dischargeId`,
      args: [],
    }),
  ]);

  const profileRows = profiles.rows as Record<string, unknown>[];
  const planRows    = plans.rows as Record<string, unknown>[];
  const followRows  = followUps.rows as Record<string, unknown>[];
  const dischargeRows = discharges.rows as Record<string, unknown>[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Nutrición</h1>
        <p className="page-subtitle">
          Tablas <code className="text-slate-600">NutritionalProfiles</code>,{' '}
          <code className="text-slate-600">NutritionalPlans</code>,{' '}
          <code className="text-slate-600">NutritionalFollowUps</code>,{' '}
          <code className="text-slate-600">NutritionalDischarges</code>
        </p>
      </div>

      <AdminDataTable
        title="NutritionalProfiles"
        rowKey={row => Number(row.profileId)}
        columns={[
          { key: 'profileId',              label: 'ID' },
          { key: 'patientId',              label: 'ID paciente' },
          { key: 'patientName',            label: 'Paciente' },
          { key: 'waistCircumference',     label: 'Cintura' },
          { key: 'bodyFatPercentage',      label: '% grasa' },
          { key: 'physicalActivityLevel',  label: 'Actividad' },
          { key: 'familyHistory',          label: 'Antecedentes' },
          { key: 'dietaryRecall24h',       label: 'Recordatorio 24h' },
          { key: 'consumptionFrequency',   label: 'Frecuencia consumo' },
          { key: 'dietaryHabits',          label: 'Hábitos' },
          { key: 'mealSchedule',           label: 'Horario comidas' },
          { key: 'waterConsumptionLiters', label: 'Agua (L)' },
          { key: 'nutritionalDiagnosis',   label: 'Diagnóstico nutricional' },
          { key: 'metabolicRisk',          label: 'Riesgo metabólico' },
          { key: 'nutritionalObjective',   label: 'Objetivo' },
          { key: 'createdAt',              label: 'Creado' },
        ]}
        rows={profileRows}
      />

      <AdminDataTable
        title="NutritionalPlans"
        rowKey={row => Number(row.planId)}
        columns={[
          { key: 'planId',                   label: 'ID plan' },
          { key: 'patientId',                label: 'ID paciente' },
          { key: 'patientName',              label: 'Paciente' },
          { key: 'nutritionistId',           label: 'ID nutriólogo' },
          { key: 'nutritionistName',         label: 'Nutriólogo' },
          { key: 'caloricRequirement',       label: 'Kcal' },
          { key: 'macrosDistribution',       label: 'Macros' },
          { key: 'weeklyMenu',               label: 'Menú semanal' },
          { key: 'equivalencesList',         label: 'Equivalencias' },
          { key: 'generalRecommendations',   label: 'Recomendaciones' },
          { key: 'pdfUrl',                   label: 'PDF' },
          { key: 'patientAccepted',          label: 'Aceptado (0/1)' },
          { key: 'creationDate',             label: 'Fecha creación' },
        ]}
        rows={planRows}
      />

      <AdminDataTable
        title="NutritionalFollowUps"
        rowKey={row => Number(row.followUpId)}
        columns={[
          { key: 'followUpId',           label: 'ID' },
          { key: 'planId',               label: 'ID plan' },
          { key: 'patientId',            label: 'ID paciente' },
          { key: 'consultationId',       label: 'ID consulta' },
          { key: 'currentWeight',        label: 'Peso' },
          { key: 'currentBmi',           label: 'IMC' },
          { key: 'bodyMeasurements',     label: 'Medidas (JSON)' },
          { key: 'compliancePercentage', label: '% cumplimiento' },
          { key: 'adjustmentsMade',      label: 'Ajustes' },
          { key: 'newGoals',             label: 'Nuevas metas' },
          { key: 'followUpDate',         label: 'Fecha' },
        ]}
        rows={followRows}
      />

      <AdminDataTable
        title="NutritionalDischarges"
        rowKey={row => Number(row.dischargeId)}
        columns={[
          { key: 'dischargeId',                  label: 'ID' },
          { key: 'planId',                       label: 'ID plan' },
          { key: 'patientId',                    label: 'ID paciente' },
          { key: 'goalReached',                  label: 'Meta (0/1)' },
          { key: 'targetWeightAchieved',         label: 'Peso meta' },
          { key: 'treatmentDurationDays',        label: 'Días tratamiento' },
          { key: 'maintenanceRecommendations',   label: 'Mantenimiento' },
          { key: 'dischargeReason',            label: 'Motivo' },
          { key: 'dischargeDate',              label: 'Fecha alta' },
        ]}
        rows={dischargeRows}
      />
    </div>
  );
}
