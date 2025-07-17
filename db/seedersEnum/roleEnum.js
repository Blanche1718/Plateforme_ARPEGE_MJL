const roles = [
    {
        label: 'Super Admin',
        code: 'super_admin',
        code_ad: 'notation_adm',
        disabled: false,
        hidden: false,
        parent_id: null,
        is_admin: false
    },
    {
        label: 'Garde des seaux',
        code: 'gs',
        code_ad: 'notation_gs',
        disabled: false,
        hidden: false,
        parent_id: null,
        is_admin: true // Admin
    },
    {
        label: 'DSPJ',
        code: 'dspj',
        code_ad: 'notation_dspj',
        disabled: false,
        hidden: false,
        parent_id: null,
        is_admin: true // Admin
    },
    {
        label: 'DPAF',
        code: 'dpaf',
        code_ad: 'notation_dpaf',
        disabled: false,
        hidden: false,
        parent_id: null,
        is_admin: true // Admin
    },
    {
        label: 'Sécrétaire Général du ministère',
        code: 'sgm',
        code_ad: 'notation_sgm',
        disabled: false,
        hidden: false,
        parent: "dpaf",
        is_admin: true// Admin
    },
    {
        label: 'Directeur du Cabinet',
        code: 'dc',
        code_ad: 'notation_dc',
        disabled: false,
        hidden: false,
        parent: "dapf",
        is_admin: true // Admin
    },
    {
        label: 'Personnel au SGM',
        code: 'personnel_sgm',
        code_ad: 'notation_personnel_sgm',
        disabled: false,
        hidden: false,
        parent: "sgm", // Sécrétaire Général
        is_admin: false
    },
    {
        label: 'Personnel au Cabinet',
        code: 'personnel_cabinet',
        code_ad: 'notation_personnel_cabinet',
        disabled: false,
        hidden: false,
        parent: "dc", // Directeur du Cabinet
        is_admin: false
    },
    {
        label: 'Directeur',
        code: 'directeur',
        code_ad: 'notation_directeur',
        disabled: false,
        hidden: false,
        parent: "sgm",
        is_admin: false
    },
    {
        label: 'Personnel au Ministère',
        code: 'personnel_ministere',
        code_ad: 'notation_personnel_ministere',
        disabled: false,
        hidden: false,
        parent: "directeur",
        is_admin: false
    },
    {
        label: 'Procureur',
        code: 'procureur',
        code_ad: 'notation_procureur',
        disabled: false,
        hidden: false,
        parent: "dspj",
        is_admin: false
    },
    {
        label: 'Président du tribunal',
        code: 'president_tribunal',
        code_ad: 'notation_president_tribunal',
        disabled: false,
        hidden: false,
        parent: "dspj",
        is_admin: false
    },
    {
        label: 'Le greffier en chef',
        code: 'gec',
        code_ad: 'notation_gec',
        disabled: false,
        hidden: false,
        parent: "dspj",
        is_admin: false
    },
    {
        label: 'Juge d\'instruction',
        code: 'juge_instruction',
        code_ad: 'notation_juge_instruction',
        disabled: false,
        hidden: false,
        parent: "president_tribunal",
        is_admin: false
    },
    {
        label: 'Agent de chambre',
        code: 'agent_chambre',
        code_ad: 'notation_agent_chambre',
        disabled: false,
        hidden: false,
        parent: "juge_instruction",
        is_admin: false
    },
    {
        label: 'Simple agent du tribunal',
        code: 'agent_simple',
        code_ad: 'notation_agent_simple',
        disabled: false,
        hidden: false,
        parent: "president_tribunal",
        is_admin: false
    },
    {
        label: 'Agent au parquet',
        code: 'agent_parquet',
        code_ad: 'notation_agent_parquet',
        disabled: false,
        hidden: false,
        parent: "procureur",
        is_admin: false
    },
    {
        label: 'Agent greffe',
        code: 'agent_greffe',
        code_ad: 'notation_agent_greffe',
        disabled: false,
        hidden: false,
        parent: "gec",
        is_admin: false
    },
    {
        label: 'Agent à la présidence (Tribunal)',
        code: 'agent_presidence',
        code_ad: 'notation_agent_presidence',
        disabled: false,
        hidden: false,
        parent: "president_tribunal",
        is_admin: false
    },
];

module.exports = roles;