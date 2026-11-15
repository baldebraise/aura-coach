import { Exercise } from '../types';

export const EXERCISES_DATABASE: Exercise[] = [
  // Pectoraux
  {
    id: 'bench-press-barbell',
    name: 'Développé Couché (Barre)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    requiredEquipment: ['barbell', 'bench'],
    alternativeExerciseIds: ['bench-press-dumbbells', 'pushups-standard', 'chest-press-machine'],
    setupCues: [
      'Allongé sur le banc, yeux sous la barre',
      'Pieds fermement ancrés au sol, fessiers et haut du dos en contact permanent',
      'Omoplates serrées et rétractées dans le banc',
      'Prise légèrement plus large que la largeur des épaules'
    ],
    executionCues: [
      'Décrocher la barre et la stabiliser au-dessus de la poitrine',
      'Descendre de manière contrôlée vers le bas des pectoraux',
      'Coudes orientés à environ 45-60 degrés par rapport au buste (pas à 90°)',
      'Pousser de façon explosive sans décoller les fessiers'
    ],
    breathingCues: 'Inspirer profondément et bloquer à la descente (manœuvre de Valsalva), expirer après le passage du point dur à la montée.',
    commonMistakes: [
      'Écarter les coudes à 90 degrés (risque de conflit sous-acromial de l épaule)',
      'Faire rebondir la barre sur la cage thoracique',
      'Décoller le bassin du banc pendant la poussée'
    ],
    svgDiagramId: 'chest',
    defaultRestSeconds: 120
  },
  {
    id: 'bench-press-dumbbells',
    name: 'Développé Couché (Haltères)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['bench-press-barbell', 'pushups-standard', 'chest-press-machine'],
    setupCues: [
      'Assis avec les haltères sur les genoux, basculer en arrière sur le banc',
      'Pieds au sol, omoplates verrouillées et serrées',
      'Haltères tenus en prise neutre ou semi-pronation'
    ],
    executionCues: [
      'Descendre les haltères de chaque côté de la poitrine avec amplitude complète',
      'Sentir un bon étirement des pectoraux en bas sans forcer sur les épaules',
      'Pousser en convergeant légèrement les haltères au sommet sans les entrechoquer'
    ],
    breathingCues: 'Inspiration contrôlée lors de la descente, expiration en fin de poussée.',
    commonMistakes: [
      'Faire s entrechoquer violemment les haltères en haut',
      'Perdre la stabilité des omoplates au sommet',
      'Amplitude écourtée'
    ],
    svgDiagramId: 'chest',
    defaultRestSeconds: 90
  },
  {
    id: 'pushups-standard',
    name: 'Pompes Classiques (Poids de corps)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'abs', 'shoulders'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['bench-press-barbell', 'bench-press-dumbbells'],
    setupCues: [
      'Mains au sol largeur des épaules ou légèrement plus larges',
      'Corps parfaitement gainé de la tête aux talons',
      'Fessiers et abdominaux contractés'
    ],
    executionCues: [
      'Descendre le buste jusqu à frôler le sol',
      'Garder les coudes rentrés à 45 degrés du buste',
      'Repousser le sol de manière dynamique en conservant la ligne droite'
    ],
    breathingCues: 'Inspirer à la descente, expirer en repoussant le sol.',
    commonMistakes: [
      'Creuser le bas du dos (manque de gainage abdominal)',
      'Laisser la tête tomber vers l avant',
      'Coudes écartés en croix'
    ],
    svgDiagramId: 'chest',
    defaultRestSeconds: 60
  },
  {
    id: 'cable-crossover',
    name: 'Écartés à la Poulie Vis-à-Vis',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['pushups-standard', 'bench-press-dumbbells'],
    setupCues: [
      'Poulies réglées à mi-hauteur ou en position haute',
      'Un pas en avant pour mettre les câbles en tension, buste légèrement incliné',
      'Léger fléchissement constant au niveau des coudes'
    ],
    executionCues: [
      'Ramener les poignées l une vers l autre en arc de cercle devant soi',
      'Contracter volontairement les pectoraux pendant 1 seconde au sommet',
      'Contrôler le retour en sentant l étirement des fibres musculaires'
    ],
    breathingCues: 'Inspirer à l ouverture, expirer lors du rapprochement des mains.',
    commonMistakes: [
      'Transformer le mouvement en développé en pliant excessivement les coudes',
      'Balancement du buste'
    ],
    svgDiagramId: 'chest',
    defaultRestSeconds: 60
  },

  // Dos
  {
    id: 'pullups-pronated',
    name: 'Tractions Pronation',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders', 'abs'],
    requiredEquipment: ['pullup_bar'],
    alternativeExerciseIds: ['lat-pulldown-machine', 'barbell-row', 'dumbbell-row'],
    setupCues: [
      'Prise en pronation (paumes vers l avant), un peu plus large que les épaules',
      'Départ bras tendus (suspension passive puis active)',
      'Abaisser les épaules et engager les dorsaux avant de tirer'
    ],
    executionCues: [
      'Tirer en amenant le haut du torse vers la barre',
      'Penser à amener les coudes vers le bas et l arrière',
      'Menton au-dessus de la barre, puis redescente contrôlée jusqu à extension complète'
    ],
    breathingCues: 'Inspirer en bas, expirer pendant la montée vers la barre.',
    commonMistakes: [
      'Utiliser le balancement des jambes (kipping non maîtrisé)',
      'Ne pas réaliser l amplitude complète en bas',
      'Enrouler les épaules vers l avant au sommet'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 120
  },
  {
    id: 'lat-pulldown-machine',
    name: 'Tirage Vertical à la Poulie Haute',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    requiredEquipment: ['lat_pulldown', 'cable_machine'],
    alternativeExerciseIds: ['pullups-pronated', 'dumbbell-row'],
    setupCues: [
      'Assis sur la machine, cuisses calées sous les boudins',
      'Prise large, buste très légèrement penché en arrière (15 degrés maximum)',
      'Cage thoracique ouverte et omoplates abaissées'
    ],
    executionCues: [
      'Tirer la barre vers le haut de la poitrine (clavicules)',
      'Coudes tirés vers le bas et les côtes',
      'Marquer un temps d arrêt de contraction avant de remonter avec contrôle'
    ],
    breathingCues: 'Inspirer bras tendus, expirer en tirant la barre vers le torse.',
    commonMistakes: [
      'Tirer la barre derrière la nuque (stress excessif sur les cervicales)',
      'Donner un grand coup de rein en arrière pour démarrer la charge'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 90
  },
  {
    id: 'dumbbell-row',
    name: 'Tirage Bûcheron (Haltère unilatéral)',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['lat-pulldown-machine', 'pullups-pronated'],
    setupCues: [
      'Un genou et une main en appui stable sur le banc',
      'Dos parfaitement plat et parallèle au sol, cou aligné',
      'Haltère tenu dans la main libre, bras vertical'
    ],
    executionCues: [
      'Tirer l haltère vers la hanche en guidant avec le coude',
      'Serrer l omoplate vers la colonne en haut du mouvement',
      'Redescendre en étirant le grand dorsal sans pivoter le buste'
    ],
    breathingCues: 'Inspirer en bas, expirer en montant l haltère.',
    commonMistakes: [
      'Faire tourner le torse pour tricher avec l élan',
      'Monter l haltère vers l épaule plutôt que vers la hanche'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 75
  },

  // Jambes & Fessiers
  {
    id: 'barbell-back-squat',
    name: 'Squat Arrière (Barre)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['leg-press-machine', 'goblet-squat-dumbbell', 'bodyweight-squat'],
    setupCues: [
      'Barre posée sur les trapèzes (high bar) ou l arrière des deltoïdes (low bar)',
      'Pieds écartés largeur des épaules, pointes légèrement ouvertes vers l extérieur (15-30°)',
      'Torse fier, regard droit, gainage abdominal verrouillé'
    ],
    executionCues: [
      'Initier la descente en poussant le bassin vers l arrière et en ouvrant les genoux',
      'Les genoux suivent la direction des pointes de pieds',
      'Descendre au moins jusqu à ce que les cuisses soient parallèles au sol',
      'Repousser le sol avec toute la plante des pieds en gardant le dos droit'
    ],
    breathingCues: 'Grande inspiration ventrale avant la descente, bloquer le tronc, expirer en remontant au-delà du point d effort.',
    commonMistakes: [
      'Genoux qui rentrent vers l intérieur (valgus du genou)',
      'Décoller les talons du sol',
      'Arrondir le bas du dos en bas de course (rétroversion/butt-wink)'
    ],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 150
  },
  {
    id: 'goblet-squat-dumbbell',
    name: 'Goblet Squat (Haltère / Kettlebell)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['abs'],
    requiredEquipment: ['dumbbells', 'kettlebell'],
    alternativeExerciseIds: ['barbell-back-squat', 'leg-press-machine', 'bodyweight-squat'],
    setupCues: [
      'Haltère tenu verticalement à deux mains contre la poitrine sous le menton',
      'Pieds légèrement plus larges que les hanches',
      'Coudes orientés vers le bas'
    ],
    executionCues: [
      'Descendre entre les hanches en gardant le torse le plus vertical possible',
      'Les coudes viennent effleurer l intérieur des cuisses au point bas',
      'Pousser dans les talons et le milieu du pied pour remonter'
    ],
    breathingCues: 'Inspirer à la descente, expirer lors de la remontée.',
    commonMistakes: [
      'Laisser l haltère s écarter du torse (crée un bras de levier inutile sur le dos)',
      'Perte d équilibre sur les orteils'
    ],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 90
  },
  {
    id: 'bodyweight-squat',
    name: 'Air Squat (Poids de corps)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['calves'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['goblet-squat-dumbbell', 'barbell-back-squat'],
    setupCues: [
      'Debout, pieds écartés largeur des épaules',
      'Bras tendus devant soi ou mains jointes pour l équilibre'
    ],
    executionCues: [
      'Descendre en contrôlant la vitesse, cuisses sous la parallèle',
      'Maintenir le buste droit et la voûte plantaire ancrée'
    ],
    breathingCues: 'Inspirer en descendant, expirer en montant.',
    commonMistakes: ['Descente trop rapide et sans contrôle'],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 60
  },
  {
    id: 'leg-press-machine',
    name: 'Presse à Cuisses Inclinée',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    requiredEquipment: ['leg_press'],
    alternativeExerciseIds: ['barbell-back-squat', 'goblet-squat-dumbbell'],
    setupCues: [
      'Dos et bassin parfaitement plaqués contre le dossier de la presse',
      'Pieds au centre de la plateforme, écartés largeur des épaules',
      'Déverrouiller les sécurités avec les mains sur les poignées latérales'
    ],
    executionCues: [
      'Descendre le plateau sans décoller le bas du dos du siège',
      'Former un angle de 90 degrés aux genoux',
      'Repousser la charge sans jamais verrouiller complètement les genoux en haut (garder une légère flexion)'
    ],
    breathingCues: 'Inspirer à la descente, expirer lors de la poussée.',
    commonMistakes: [
      'Verrouiller brutalement les genoux en hyperextension en haut',
      'Décoller le sacrum du dossier en bas (pression lombaire dangereuse)'
    ],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 90
  },
  {
    id: 'romanian-deadlift-dumbbells',
    name: 'Soulevé de Terre Jambes Tendues (Haltères)',
    category: 'strength',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back'],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['barbell-back-squat'],
    setupCues: [
      'Debout, un haltère dans chaque main contre l avant des cuisses',
      'Pieds largeur des hanches, genoux très légèrement déverrouillés (fixes)'
    ],
    executionCues: [
      'Envoyer les fesses vers l arrière en penchant le buste (mouvement de charnière de hanche)',
      'Glisser les haltères le long des tibias jusqu à mi-hauteur',
      'Sentir la tension vive dans les ischios, puis contracter les fessiers pour se redresser'
    ],
    breathingCues: 'Inspirer en reculant les hanches, expirer en verrouillant les fessiers en haut.',
    commonMistakes: [
      'Arrondir le dos pour aller chercher plus bas',
      'Plier excessivement les genoux (transforme le mouvement en squat)'
    ],
    svgDiagramId: 'hamstrings',
    defaultRestSeconds: 90
  },

  // Épaules
  {
    id: 'overhead-press-dumbbells',
    name: 'Développé Militaire Assis (Haltères)',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['pushups-standard'],
    setupCues: [
      'Assis sur un banc avec dossier à environ 75-80 degrés',
      'Haltères au niveau des oreilles, paumes vers l avant ou semi-neutres',
      'Pieds au sol, tronc engagé'
    ],
    executionCues: [
      'Pousser les haltères vers le ciel en trajectoire verticale',
      'Terminer bras tendus au-dessus de la tête sans cambrer le dos',
      'Redescendre sous contrôle jusqu à la hauteur des épaules'
    ],
    breathingCues: 'Inspirer en bas, expirer en poussant vers le haut.',
    commonMistakes: [
      'Cambrer exagérément les lombaires',
      'Descendre trop bas en tirant sur les rotateurs externes'
    ],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 90
  },
  {
    id: 'lateral-raises-dumbbells',
    name: 'Élévations Latérales (Haltères)',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: [],
    setupCues: [
      'Debout, pieds largeur d épaules, haltères le long du corps',
      'Léger fléchissement des coudes (qui ne bouge pas)',
      'Buste très légèrement incliné vers l avant (5 degrés)'
    ],
    executionCues: [
      'Élever les bras sur les côtés jusqu à l horizontale (hauteur des épaules)',
      'Penser à monter les coudes plutôt que les mains',
      'Contrôler la descente pendant 2 secondes sans relâcher la tension'
    ],
    breathingCues: 'Expirer à la montée, inspirer à la descente.',
    commonMistakes: [
      'Prendre de l élan avec les jambes ou le buste (charge trop lourde)',
      'Monter les mains au-dessus des coudes'
    ],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 60
  },

  // Bras (Biceps & Triceps)
  {
    id: 'biceps-curl-dumbbells',
    name: 'Curl Biceps Incliné / Debout (Haltères)',
    category: 'strength',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['pullups-pronated'],
    setupCues: [
      'Debout ou assis, coudes plaqués près des côtes',
      'Poitrine sortie, épaules basses'
    ],
    executionCues: [
      'Fléchir les avant-bras en tournant les paumes vers le haut (supination)',
      'Contracter fortement les biceps au sommet',
      'Redescendre lentement sans laisser partir les coudes en arrière'
    ],
    breathingCues: 'Expirer en montant, inspirer à la descente.',
    commonMistakes: [
      'Projeter les coudes en avant pour faciliter la fin du mouvement',
      'Balancement du bassin'
    ],
    svgDiagramId: 'biceps',
    defaultRestSeconds: 60
  },
  {
    id: 'triceps-cable-pushdown',
    name: 'Extension Triceps à la Corde (Poulie)',
    category: 'strength',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['pushups-standard'],
    setupCues: [
      'Corde attachée à la poulie haute',
      'Coudes collés au buste, genoux légèrement fléchis, buste incliné'
    ],
    executionCues: [
      'Pousser la corde vers le bas jusqu à extension complète des bras',
      'Écarter légèrement les extrémités de la corde en fin de course pour une contraction maximale',
      'Remonter jusqu à 90 degrés aux coudes sans bouger les épaules'
    ],
    breathingCues: 'Expirer en étendant les bras, inspirer en remontant.',
    commonMistakes: ['Laisser les coudes s écarter ou monter vers l avant'],
    svgDiagramId: 'triceps',
    defaultRestSeconds: 60
  },

  // Abdos & Gainage
  {
    id: 'plank-isometric',
    name: 'Gainage Planche Ventrale (Isométrique)',
    category: 'isometric',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['shoulders', 'glutes'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: [],
    setupCues: [
      'En appui sur les avant-bras et la pointe des pieds',
      'Coudes alignés directement sous les épaules',
      'Nuque neutre dans le prolongement de la colonne vertébrale'
    ],
    executionCues: [
      'Maintenir le corps en ligne droite rigide',
      'Rétroversion légère du bassin (serrer les fessiers et aspirer le nombril vers la colonne)',
      'Pousser le sol avec les avant-bras pour écarter les omoplates'
    ],
    breathingCues: 'Respiration diaphragmatique lente et continue sans jamais bloquer l air.',
    commonMistakes: [
      'Laisser le bassin s affaisser vers le bas',
      'Lever les fesses trop haut en toit de tente'
    ],
    svgDiagramId: 'abs',
    defaultRestSeconds: 45
  },

  // Isométrie & Tests
  {
    id: 'wall-sit-isometric',
    name: 'Chaise Isométrique contre le Mur',
    category: 'isometric',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['calves', 'glutes'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: [],
    setupCues: [
      'Dos complètement plaqué à plat contre un mur vertical',
      'Pieds au sol largeur de hanches',
      'Descendre jusqu à ce que les cuisses soient parallèles au sol (angle 90° hanches et genoux)'
    ],
    executionCues: [
      'Plaquer le dos et les épaules contre le mur',
      'Mains le long du corps ou sur le torse (jamais en appui sur les genoux)',
      'Maintenir la position immobile pendant le temps imparti'
    ],
    breathingCues: 'Respirations calmes et régulières.',
    commonMistakes: ['S appuyer sur les cuisses avec les mains pour tricher'],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 60
  }
];
