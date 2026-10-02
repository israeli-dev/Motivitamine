export interface PresetPairing {
  id: string;
  occupation: string;
  hobbies: string;
  name: string;
  tone: 'empowering' | 'philosophical' | 'zen' | 'poetic' | 'witty';
  label: string;
}

export const INSPIRATIONAL_PRESETS: PresetPairing[] = [
  {
    id: 'dev-climber',
    name: 'Elena',
    occupation: 'Software Architect',
    hobbies: 'Rock Climbing & Bouldering',
    tone: 'empowering',
    label: 'Engineer + Rock Climber',
  },
  {
    id: 'surgeon-bonsai',
    name: 'Dr. Marcus',
    occupation: 'Cardiothoracic Surgeon',
    hobbies: 'Bonsai Cultivation & Tea Ceremony',
    tone: 'zen',
    label: 'Surgeon + Bonsai Cultivator',
  },
  {
    id: 'lawyer-jazz',
    name: 'Julian',
    occupation: 'Human Rights Lawyer',
    hobbies: 'Jazz Saxophone & Vinyl Collecting',
    tone: 'philosophical',
    label: 'Lawyer + Jazz Saxophonist',
  },
  {
    id: 'chef-astronomy',
    name: 'Amara',
    occupation: 'Pastry Chef',
    hobbies: 'Astrophotography & Stargazing',
    tone: 'poetic',
    label: 'Chef + Astrophotographer',
  },
  {
    id: 'teacher-marathon',
    name: 'David',
    occupation: 'High School Literature Teacher',
    hobbies: 'Ultra-Marathon Running',
    tone: 'empowering',
    label: 'Teacher + Marathon Runner',
  },
];
