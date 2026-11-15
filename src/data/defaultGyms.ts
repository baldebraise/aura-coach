import { GymLocation } from '../types';

export const DEFAULT_GYMS: GymLocation[] = [
  {
    id: 'gym-home',
    name: 'Maison / Salon',
    isDefault: true,
    equipment: [
      'bodyweight',
      'dumbbells',
      'pullup_bar',
      'resistance_bands'
    ],
    notes: 'Entraînement au poids du corps, haltères modulables et barre de porte'
  },
  {
    id: 'gym-commercial',
    name: 'Salle de sport (Commerciale)',
    isDefault: false,
    equipment: [
      'bodyweight',
      'dumbbells',
      'barbell',
      'pullup_bar',
      'resistance_bands',
      'cable_machine',
      'leg_press',
      'lat_pulldown',
      'smith_machine',
      'kettlebell',
      'bench',
      'cardio_machine'
    ],
    notes: 'Parc complet de musculation, poids libres et machines guidées'
  },
  {
    id: 'gym-outdoor',
    name: 'Extérieur / Street Workout',
    isDefault: false,
    equipment: [
      'bodyweight',
      'pullup_bar',
      'resistance_bands'
    ],
    notes: 'Parc extérieur avec barres de traction et barres parallèles'
  }
];

export const EQUIPMENT_LABELS: Record<string, string> = {
  bodyweight: 'Poids de corps',
  dumbbells: 'Haltères',
  barbell: 'Barre olympique',
  pullup_bar: 'Barre de traction',
  resistance_bands: 'Élastiques de résistance',
  cable_machine: 'Poulies réglables',
  leg_press: 'Presse à cuisses',
  lat_pulldown: 'Tirage vertical poulie haute',
  smith_machine: 'Cadre guidé (Smith machine)',
  kettlebell: 'Kettlebells',
  bench: 'Banc de musculation réglable',
  cardio_machine: 'Tapis de course / Rameur / Vélo'
};
