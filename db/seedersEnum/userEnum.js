const users = [
    {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'admin@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-20T12:00:00Z',
        last_profile_modif: '2023-04-15T10:30:00Z',
        first_connect: false,
        role: "super_admin",
        in_ad: true
    },
    {
        first_name: 'YVON',
        last_name: 'DETCHEVOU',
        email: 'gs@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-19T16:00:00Z',
        last_profile_modif: '2023-04-14T08:45:00Z',
        first_connect: false,
        role: "gs",
        juridiction: null,
        in_ad: true
    },
    {
        first_name: 'Martial',
        last_name: 'SEMON',
        email: 'dc@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-19T16:00:00Z',
        last_profile_modif: '2023-04-14T08:45:00Z',
        first_connect: false,
        role: "dc",
        juridiction: null,
        in_ad: true
    },
    {
        first_name: 'Direction des Services et Professions Judiciaires',
        last_name: 'DSPJ',
        email: 'dspj@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-18T14:00:00Z',
        last_profile_modif: '2023-04-10T09:00:00Z',
        first_connect: false,
        role: "dspj",
        in_ad: true
    },
    {
        first_name: 'Direction de la Planification, de l\'Administration et des Finances',
        last_name: 'DPAF',
        email: 'dpaf@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-18T14:00:00Z',
        last_profile_modif: '2023-04-10T09:00:00Z',
        first_connect: false,
        role: "dpaf",
        in_ad: true
    },
    {
        first_name: 'Marie',
        last_name: 'Curie',
        email: 'procureur@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-18T14:00:00Z',
        last_profile_modif: '2023-04-10T09:00:00Z',
        first_connect: false,
        role: "procureur",
        juridiction: "TPI-COT",
        entite: "TPI-COT",
        in_ad: false
    },
    {
        first_name: 'Pierre',
        last_name: 'Martin',
        email: 'greffier@gouv.bj',
        password: 'password',
        last_connexion: '2023-04-19T16:00:00Z',
        last_profile_modif: '2023-04-14T08:45:00Z',
        first_connect: false,
        role: "gec",
        juridiction: "TPI-COT",
        in_ad: false
    },
    {
        first_name: "Alice",
        last_name: "Martin",
        email: "alice.martin@gouv.bj",
        password: "password",
        last_connexion: "2023-05-01T10:30:00Z",
        last_profile_modif: "2023-04-25T08:00:00Z",
        first_connect: false,
        role: "procureur",
        juridiction: "TPI-POR",
        in_ad: false
    },
    {
        first_name: "Pierre",
        last_name: "Dupuis",
        email: "pierre.dupuis@gouv.bj",
        password: "password",
        last_connexion: "2023-05-02T12:00:00Z",
        last_profile_modif: "2023-04-28T14:00:00Z",
        first_connect: false,
        role: "procureur",
        juridiction: "TPI-COT",
        in_ad: false
    },
    {
        first_name: "Sophie",
        last_name: "Lemoine",
        email: "sophie.lemoine@gouv.bj",
        password: "password",
        last_connexion: "2023-05-03T15:45:00Z",
        last_profile_modif: "2023-04-29T11:00:00Z",
        first_connect: false,
        role: "procureur",
        juridiction: "TPI-ABO",
        in_ad: false
    },
    {
        first_name: "Personne du ministere",
        last_name: "Lemoine",
        email: "perso.minis@gouv.bj",
        password: "password",
        last_connexion: "2023-05-03T15:45:00Z",
        last_profile_modif: "2023-04-29T11:00:00Z",
        first_connect: false,
        role: "procureur",
        juridiction: "TPI-ABO",
        in_ad: false
    }
];

module.exports = users;