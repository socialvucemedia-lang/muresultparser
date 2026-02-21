export interface Branch {
    id: string;
    name: string;
    file: string;
}

export const BRANCHES: Branch[] = [
    { id: 'comps', name: 'Computer Engineering', file: 'computer.json' },
    //{ id: 'it', name: 'Information Technology', file: 'it.json' },
    //{ id: 'extc', name: 'Electronics & Telecommunication', file: 'extc.json' },
    { id: 'mech', name: 'Mechanical Engineering', file: 'mechanical.json' },
    { id: 'aids', name: 'AI & Data Science', file: 'aids.json' },
];

export const DEFAULT_BRANCH = 'comps';
