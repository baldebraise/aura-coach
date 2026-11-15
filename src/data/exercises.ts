import { Exercise } from '../types';

export const EXERCISES_DATABASE: Exercise[] = [
  // ==========================================
  // PECTORAUX (POUSSÉE HORIZONTALE & INCLINÉE)
  // ==========================================
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
    alternativeExerciseIds: ['bench-press-barbell', 'pushups-standard'],
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
    id: 'incline-bench-press-barbell',
    name: 'Développé Incliné (Barre)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    requiredEquipment: ['barbell', 'bench'],
    alternativeExerciseIds: ['incline-bench-press-dumbbells', 'pushups-decline'],
    setupCues: [
      'Banc incliné à 30 degrés (éviter 45° qui sur-sollicite les deltoïdes antérieurs)',
      'Omoplates serrées et enfoncées dans le dossier',
      'Prise modérée, avant-bras verticaux en bas du mouvement'
    ],
    executionCues: [
      'Descendre la barre sur le haut de la poitrine (sous les clavicules)',
      'Conserver les coudes sous les poignets tout au long de la trajectoire',
      'Pousser vers le haut et légèrement vers l arrière'
    ],
    breathingCues: 'Inspirer en descendant, expirer après le tiers supérieur de la montée.',
    commonMistakes: [
      'Inclinaison de banc trop forte (> 40°)',
      'Décoller le dos du dossier pour transformer l exercice en développé couché'
    ],
    svgDiagramId: 'chest',
    defaultRestSeconds: 120
  },
  {
    id: 'incline-bench-press-dumbbells',
    name: 'Développé Incliné (Haltères)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['incline-bench-press-barbell'],
    setupCues: [
      'Banc incliné à 30°, haltères portés sur les cuisses avant de s allonger',
      'Pieds stables et omoplates verrouillées en rétraction'
    ],
    executionCues: [
      'Descendre les haltères au niveau du haut des pectoraux avec un étirement profond',
      'Pousser en arc de cercle contrôlé sans claquer les charges en haut'
    ],
    breathingCues: 'Inspirer à la descente, expirer lors de la poussée.',
    commonMistakes: ['Descendre trop bas avec les coudes trop écartés'],
    svgDiagramId: 'chest',
    defaultRestSeconds: 90
  },
  {
    id: 'dips-chest',
    name: 'Dips Pectoraux (Barres Parallèles)',
    category: 'strength',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['bench-press-barbell', 'pushups-standard'],
    setupCues: [
      'En appui sur les barres parallèles, bras tendus',
      'Buste incliné vers l avant à environ 30 degrés pour cibler les pectoraux',
      'Genoux fléchis et jambes croisées'
    ],
    executionCues: [
      'Descendre en ouvrant légèrement les coudes jusqu à ce que les bras soient à 90 degrés',
      'Maintenir le buste penché vers l avant sans cambrer',
      'Pousser de façon dynamique pour revenir en haut sans verrouiller violemment'
    ],
    breathingCues: 'Inspirer à la descente, expirer en remontant.',
    commonMistakes: [
      'Rester trop droit (reporte toute la tension sur les triceps et l épaule)',
      'Descendre trop bas en hyperextension de la capsule antérieure de l épaule'
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
    id: 'pushups-decline',
    name: 'Pompes Déclinées (Pieds surélevés)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps', 'abs'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['incline-bench-press-dumbbells', 'pushups-standard'],
    setupCues: [
      'Pieds posés sur un banc ou une boîte (30-40 cm de haut)',
      'Mains au sol largeur d épaules, corps gainé rigide'
    ],
    executionCues: [
      'Descendre le buste vers le sol en maintenant l alignement bassin-colonne',
      'Repousser le sol avec force en finissant bras tendus'
    ],
    breathingCues: 'Inspirer à la descente, expirer à la montée.',
    commonMistakes: ['Bassin qui s affaisse sous l effet de la hauteur des pieds'],
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
      'Ramener les poignées l une vers l autre devant la poitrine en arc de cercle',
      'Contracter volontairement les pectoraux au point de convergence pendant 1 seconde',
      'Contrôler le retour en sentant l étirement des fibres pectorales'
    ],
    breathingCues: 'Expirer en fermant les bras, inspirer lors de l ouverture contrôlée.',
    commonMistakes: [
      'Plier et tendre les bras comme sur un développé (perte d isolation)',
      'Donner des à-coups avec le buste'
    ],
    svgDiagramId: 'chest',
    defaultRestSeconds: 60
  },
  {
    id: 'dumbbell-flyes-flat',
    name: 'Écartés Couchés (Haltères)',
    category: 'strength',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['cable-crossover'],
    setupCues: [
      'Allongé sur banc plat, haltères tenus au-dessus du torse en prise neutre',
      'Coudes légèrement déverrouillés et maintenus fixes'
    ],
    executionCues: [
      'Ouvrir les bras de chaque côté jusqu à sentir un étirement modéré des pectoraux',
      'Refermer les bras en arc de cercle sans modifier l angle des coudes'
    ],
    breathingCues: 'Inspirer lors de l ouverture, expirer en refermant.',
    commonMistakes: ['Tendre complètement les coudes en bas de course (torsion du biceps)'],
    svgDiagramId: 'chest',
    defaultRestSeconds: 60
  },

  // ==========================================
  // DOS (TIRAGES VERTICAUX, HORIZONTAUX & SOULEVÉS)
  // ==========================================
  {
    id: 'deadlift-conventional',
    name: 'Soulevé de Terre Conventionnel (Barre)',
    category: 'strength',
    primaryMuscles: ['back', 'hamstrings', 'glutes'],
    secondaryMuscles: ['quadriceps', 'abs', 'calves'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['romanian-deadlift', 't-bar-row'],
    setupCues: [
      'Pieds sous la barre à largeur de hanches, barre au milieu des lacets',
      'Prise manuelle juste à l extérieur des tibias',
      'Tension préalable dans la barre pour supprimer le jeu avant de décoller'
    ],
    executionCues: [
      'Pousser le sol avec les jambes tout en gardant la barre au contact des tibias',
      'Extension simultanée des genoux et des hanches',
      'Verrouiller le bassin au sommet sans hyperextension lombaire'
    ],
    breathingCues: 'Inspirer au sol, bloquer pendant toute la phase de décollage, expirer au sommet.',
    commonMistakes: [
      'Arrondir la région lombaire sous la charge',
      'Barre qui s éloigne des tibias vers l avant'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 150
  },
  {
    id: 'pullups-pronated',
    name: 'Tractions en Pronation (Poids de corps)',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    requiredEquipment: ['pullup_bar'],
    alternativeExerciseIds: ['lat-pulldown-cable', 'barbell-row-bent-over'],
    setupCues: [
      'Suspendu à la barre fixe, paumes tournées vers l avant (pronation)',
      'Prise plus large que les épaules',
      'Corps gainé, jambes tendues ou légèrement croisées sans balancement'
    ],
    executionCues: [
      'Initier le mouvement en abaissant les omoplates vers le bas et l arrière',
      'Tirer les coudes vers le bas et les côtes pour hisser la poitrine vers la barre',
      'Passer le menton au-dessus de la barre',
      'Contrôler la descente jusqu à extension quasi-complète des bras'
    ],
    breathingCues: 'Expirer en montant, inspirer lors de la phase négative (descente).',
    commonMistakes: [
      'Kipping ou battement de jambes pour créer de l élan',
      'Ne pas réaliser l amplitude complète en bas',
      'Enrouler les épaules vers l avant en haut de course'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 90
  },
  {
    id: 'lat-pulldown-cable',
    name: 'Tirage Vertical à la Poulie Haute',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    requiredEquipment: ['lat_pulldown'],
    alternativeExerciseIds: ['pullups-pronated', 'barbell-row-bent-over'],
    setupCues: [
      'Assis sur la machine, cuisses bien calées sous les boudins en mousse',
      'Prise large en pronation sur la barre',
      'Buste légèrement incliné en arrière (10-15° maximum)'
    ],
    executionCues: [
      'Tirer la barre vers le haut de la poitrine en conduisant les coudes vers le bas',
      'Serrer les omoplates en fin de course sans balancer le buste en arrière',
      'Laisser la barre remonter de façon fluide en contrôlant l étirement du grand dorsal'
    ],
    breathingCues: 'Expirer en tirant la barre vers le torse, inspirer à la remontée.',
    commonMistakes: [
      'Tirer la barre derrière la nuque (très traumatisant pour les épaules et vertèbres)',
      'Balancer le haut du corps d avant en arrière pour tricher'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 75
  },
  {
    id: 'lat-pulldown-close-grip',
    name: 'Tirage Vertical Prise Serrée Neutre',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    requiredEquipment: ['lat_pulldown'],
    alternativeExerciseIds: ['lat-pulldown-cable', 'pullups-pronated'],
    setupCues: [
      'Poignée en triangle (prise neutre) attachée à la poulie haute',
      'Cuisses calées, buste fier et légèrement penché en arrière'
    ],
    executionCues: [
      'Tirer le triangle vers le haut des pectoraux en collant les coudes près du buste',
      'Contraction maximale du grand dorsal en bas avant de remonter lentement'
    ],
    breathingCues: 'Expirer en tirant vers la poitrine, inspirer en remontant.',
    commonMistakes: ['Arrondir les épaules au sommet'],
    svgDiagramId: 'back',
    defaultRestSeconds: 75
  },
  {
    id: 'barbell-row-bent-over',
    name: 'Rowing Buste Penché (Barre)',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'hamstrings'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['lat-pulldown-cable', 'pullups-pronated', 'one-arm-dumbbell-row'],
    setupCues: [
      'Debout, pieds écartés de la largeur des épaules, barre tenue en pronation',
      'Fléchir légèrement les genoux et basculer le buste vers l avant à 45 degrés',
      'Dos parfaitement plat et droit, gainage lombaire actif'
    ],
    executionCues: [
      'Tirer la barre vers le nombril en guidant le mouvement avec les coudes',
      'Rapprocher activement les omoplates en haut',
      'Redescendre la barre sous contrôle sans arrondir le dos'
    ],
    breathingCues: 'Inspirer en bas, bloquer et expirer en arrivant au contact du ventre.',
    commonMistakes: [
      'Arrondir la colonne vertébrale pendant le tirage (risque hernie)',
      'Se redresser à la verticale lors de la phase de montée'
    ],
    svgDiagramId: 'back',
    defaultRestSeconds: 90
  },
  {
    id: 'one-arm-dumbbell-row',
    name: 'Rowing Bûcheron Unilatéral (Haltère)',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['barbell-row-bent-over', 'seated-cable-row'],
    setupCues: [
      'Un genou et une main posés sur le banc plat, dos horizontal',
      'Pied opposé fermement ancré au sol pour la stabilité',
      'Haltère tenu dans la main libre, bras vertical'
    ],
    executionCues: [
      'Tirer l haltère vers la hanche en rasant les côtes avec le coude',
      'Rétracter l omoplate au sommet sans vriller le buste',
      'Redescendre en contrôlant l étirement du grand dorsal'
    ],
    breathingCues: 'Expirer en tirant vers la hanche, inspirer à la descente.',
    commonMistakes: ['Faire pivoter violemment le buste pour lancer le poids'],
    svgDiagramId: 'back',
    defaultRestSeconds: 60
  },
  {
    id: 'seated-cable-row',
    name: 'Tirage Horizontal Poulie Basse (Prise Neutre)',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['barbell-row-bent-over', 'one-arm-dumbbell-row'],
    setupCues: [
      'Assis, pieds calés sur les plateformes, genoux légèrement fléchis',
      'Saisir la poignée en triangle, dos parfaitement droit et vertical'
    ],
    executionCues: [
      'Tirer la poignée vers l abdomen inférieur en resserrant les omoplates',
      'Conserver le buste stable sans osciller d avant en arrière',
      'Contrôler le retour des bras en maintenant la tension'
    ],
    breathingCues: 'Expirer en tirant vers soi, inspirer en relâchant avec contrôle.',
    commonMistakes: ['Hyper-cambrer ou balancer le buste en arrière'],
    svgDiagramId: 'back',
    defaultRestSeconds: 75
  },
  {
    id: 'face-pull-cable',
    name: 'Face Pull à la Poulie (Corde)',
    category: 'strength',
    primaryMuscles: ['back', 'shoulders'],
    secondaryMuscles: ['shoulders'],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['rear-delt-flyes-dumbbells'],
    setupCues: [
      'Poulie réglée au niveau des yeux ou du haut du front',
      'Corde tenue en prise neutre avec les pouces vers l arrière',
      'Un pas en arrière pour mettre la tension'
    ],
    executionCues: [
      'Tirer la corde vers le nez et les yeux en ouvrant largement les coudes vers l arrière',
      'Faire une rotation externe des épaules en fin de course (mains plus hautes que les coudes)',
      'Contracter les trapèzes moyens et le deltoïde postérieur 1 seconde'
    ],
    breathingCues: 'Expirer en tirant vers le visage, inspirer en retournant.',
    commonMistakes: ['Tirer vers la poitrine au lieu du visage (manque de rotation externe)'],
    svgDiagramId: 'back',
    defaultRestSeconds: 60
  },
  {
    id: 't-bar-row',
    name: 'Rowing Barre en T (T-Bar Row)',
    category: 'strength',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'hamstrings'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['barbell-row-bent-over', 'seated-cable-row'],
    setupCues: [
      'Barre calée dans un coin (Landmine) avec poignée double sous les disques',
      'Pieds de part et d autre de la barre, buste penché à 45° dos droit'
    ],
    executionCues: [
      'Tirer la charge vers le haut du ventre en conduisant les coudes vers l arrière',
      'Serrer le haut du dos au sommet et redescendre sans lâcher les lombaires'
    ],
    breathingCues: 'Inspirer en bas, expirer en contractant en haut.',
    commonMistakes: ['Arrondir les dorsaux sous une charge excessive'],
    svgDiagramId: 'back',
    defaultRestSeconds: 90
  },

  // ==========================================
  // ÉPAULES & DELTOÏDES (POUSSÉE VERTICALE & ISOLATION)
  // ==========================================
  {
    id: 'overhead-press-barbell',
    name: 'Développé Militaire Debout (Barre OHP)',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'abs'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['lateral-raises-dumbbells', 'pushups-standard', 'overhead-press-dumbbells'],
    setupCues: [
      'Debout, pieds écartés de la largeur des épaules, fessiers et abdos verrouillés',
      'Barre posée sur le haut des clavicules, prise légèrement plus large que les épaules',
      'Avant-bras verticaux sous la barre'
    ],
    executionCues: [
      'Rentrer légèrement le menton pour laisser passer la barre',
      'Pousser verticalement vers le ciel sans sauter ni utiliser les jambes',
      'Une fois la barre passée au-dessus de la tête, avancer légèrement la tête sous la barre',
      'Verrouiller les bras au sommet'
    ],
    breathingCues: 'Inspirer avant la poussée, bloquer le tronc, expirer au sommet.',
    commonMistakes: [
      'Cambrer exagérément les lombaires en arrière pour s aider',
      'Prendre de l élan avec les genoux (ce n est pas un Push Press)'
    ],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 90
  },
  {
    id: 'overhead-press-dumbbells',
    name: 'Développé Épaules Assis (Haltères)',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['overhead-press-barbell', 'arnold-press'],
    setupCues: [
      'Assis sur un banc avec dossier à 85-90 degrés',
      'Haltères montés au niveau des épaules, coudes orientés à 45° vers l avant'
    ],
    executionCues: [
      'Pousser les haltères vers le haut jusqu à extension complète sans les entrechoquer',
      'Redescendre sous contrôle jusqu à ce que les haltères atteignent la hauteur des oreilles'
    ],
    breathingCues: 'Expirer à la montée, inspirer à la descente.',
    commonMistakes: ['Écarter les coudes à 90° complets (pression sur la coiffe des rotateurs)'],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 75
  },
  {
    id: 'arnold-press',
    name: 'Développé Arnold (Haltères)',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['overhead-press-dumbbells'],
    setupCues: [
      'Assis sur banc avec dossier, haltères tenus devant la poitrine en supination (paumes vers soi)'
    ],
    executionCues: [
      'Pousser vers le haut en opérant une rotation fluide des poignets',
      'Finir en pronation (paumes vers l avant) au sommet des bras tendus',
      'Inverser le mouvement de rotation lors de la descente contrôlée'
    ],
    breathingCues: 'Expirer en montant et tournant, inspirer en descendant.',
    commonMistakes: ['Mouvement saccadé sans continuité dans la rotation'],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 75
  },
  {
    id: 'lateral-raises-dumbbells',
    name: 'Élévations Latérales (Haltères)',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['overhead-press-barbell', 'cable-lateral-raise'],
    setupCues: [
      'Debout, pieds largeur des hanches, légère flexion des genoux',
      'Haltères tenus le long des cuisses, coudes très légèrement fléchis'
    ],
    executionCues: [
      'Élever les bras latéralement jusqu à ce qu ils soient parallèles au sol',
      'Penser à verser une carafe d eau (pouce légèrement plus bas que le petit doigt)',
      'Contrôler la descente sans laisser les haltères retomber'
    ],
    breathingCues: 'Expirer en montant, inspirer en descendant lentement.',
    commonMistakes: [
      'Prendre de l élan avec les jambes ou hausser les trapèzes',
      'Monter les bras au-dessus de l horizontale'
    ],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 60
  },
  {
    id: 'cable-lateral-raise',
    name: 'Élévations Latérales à la Poulie Basse',
    category: 'strength',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['lateral-raises-dumbbells'],
    setupCues: [
      'Poulie réglée en bas, poignée passée derrière ou devant le corps',
      'Buste droit ou légèrement incliné vers l extérieur'
    ],
    executionCues: [
      'Lever le bras sur le côté en arc de cercle avec tension constante dès le départ',
      'Arrêter le mouvement à hauteur de l épaule et retenir la phase négative'
    ],
    breathingCues: 'Expirer à la montée, inspirer à la descente.',
    commonMistakes: ['Donner une impulsion avec le tronc'],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 60
  },
  {
    id: 'rear-delt-flyes-dumbbells',
    name: 'Oiseau Buste Penché (Haltères)',
    category: 'strength',
    primaryMuscles: ['shoulders', 'back'],
    secondaryMuscles: ['back'],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['face-pull-cable'],
    setupCues: [
      'Assis sur le bord d un banc ou debout buste penché à l horizontale',
      'Haltères tenus sous les cuisses, coudes légèrement déverrouillés'
    ],
    executionCues: [
      'Écarter les bras sur les côtés vers le plafond en isolant le deltoïde postérieur',
      'Contracter l arrière des épaules sans trop resserrer les omoplates'
    ],
    breathingCues: 'Expirer en levant les bras, inspirer en revenant.',
    commonMistakes: ['Relever le buste pour s aider'],
    svgDiagramId: 'shoulders',
    defaultRestSeconds: 60
  },

  // ==========================================
  // CUISSES, QUADRICEPS & FESSIERS
  // ==========================================
  {
    id: 'back-squat-barbell',
    name: 'Squat Arrière (Barre Back Squat)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['leg-press-45', 'walking-lunges-dumbbells', 'front-squat-barbell'],
    setupCues: [
      'Barre posée sur les trapèzes (barre haute) ou deltoïdes postérieurs (barre basse)',
      'Pieds légèrement plus larges que les hanches, pointes ouvertes à 15-30 degrés',
      'Poitrine fière, regard droit devant'
    ],
    executionCues: [
      'Initier la flexion simultanément aux hanches et aux genoux',
      'Ouvrir activement les genoux vers l extérieur dans l axe des orteils',
      'Descendre au moins jusqu à ce que les hanches soient au niveau des genoux (parallèle)',
      'Pousser à travers tout le pied pour remonter sans rentrer les genoux vers l intérieur'
    ],
    breathingCues: 'Inspirer profondément en haut, bloquer la sangle abdominale pendant la descente, expirer après le tiers supérieur de la montée.',
    commonMistakes: [
      'Genoux qui s effondrent vers l intérieur (valgus dynamique du genou)',
      'Talon qui se soulève du sol',
      'Arrondir le bas du dos en bas de mouvement (butt wink prononcé)'
    ],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 120
  },
  {
    id: 'front-squat-barbell',
    name: 'Squat Avant (Front Squat Barre)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'abs'],
    secondaryMuscles: ['glutes'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['back-squat-barbell', 'goblet-squat'],
    setupCues: [
      'Barre calée sur les deltoïdes antérieurs, coudes pointés hauts vers l avant',
      'Buste parfaitement vertical, pieds écartés à largeur d épaules'
    ],
    executionCues: [
      'Descendre profondément en gardant les coudes hauts sans jamais les laisser tomber',
      'Pousser verticalement dans le sol en gardant le torse érigé'
    ],
    breathingCues: 'Inspiration forte en haut, apnée protectrice à la descente, expiration à la montée.',
    commonMistakes: ['Laisser les coudes descendre, provoquant la chute de la barre en avant'],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 120
  },
  {
    id: 'leg-press-45',
    name: 'Presse à Cuisses Inclinée à 45°',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    requiredEquipment: ['leg_press'],
    alternativeExerciseIds: ['back-squat-barbell', 'walking-lunges-dumbbells'],
    setupCues: [
      'Dos et fessiers parfaitement plaqués contre le siège et le dossier',
      'Pieds au milieu du plateau, écartés de la largeur des épaules',
      'Déverrouiller les cales de sécurité'
    ],
    executionCues: [
      'Fléchir les genoux pour descendre le plateau avec contrôle',
      'Descendre jusqu à un angle de 90 degrés sans que le bassin ne s enroule en arrière',
      'Repousser le plateau avec force sans jamais verrouiller violemment les genoux en haut'
    ],
    breathingCues: 'Inspirer à la descente, expirer lors de la poussée.',
    commonMistakes: [
      'Décoller le bas du dos du dossier (pression énorme sur les disques lombaires)',
      'Hyper-extension / verrouillage brutal des genoux au sommet'
    ],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 90
  },
  {
    id: 'leg-extension-machine',
    name: 'Leg Extension (Machine Quadriceps)',
    category: 'strength',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: [],
    requiredEquipment: ['leg_press'],
    alternativeExerciseIds: ['back-squat-barbell', 'bulgarian-split-squat'],
    setupCues: [
      'Assis sur la machine, axe de rotation aligné avec l articulation des genoux',
      'Boudin posé au-dessus des chevilles, poignées latérales fermement tenues'
    ],
    executionCues: [
      'Étendre les jambes vers le haut jusqu à contraction complète des quadriceps',
      'Marquer 1 seconde au sommet sans à-coups',
      'Redescendre lentement en contrôlant la phase négative'
    ],
    breathingCues: 'Expirer en montant, inspirer à la descente.',
    commonMistakes: ['Donner un coup sec au départ avec les lombaires'],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 60
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Fentes Bulgares (Haltères)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    requiredEquipment: ['dumbbells', 'bench'],
    alternativeExerciseIds: ['walking-lunges-dumbbells', 'back-squat-barbell'],
    setupCues: [
      'Pied arrière posé sur le dessus du banc, pied avant avancé d environ 1 mètre',
      'Haltères tenus de chaque côté des hanches, buste fier'
    ],
    executionCues: [
      'Descendre le genou arrière vers le sol jusqu à ce que la cuisse avant soit parallèle',
      'Pousser fermement dans le talon de la jambe avant pour remonter'
    ],
    breathingCues: 'Inspirer à la descente, expirer à la remontée.',
    commonMistakes: ['Pied avant trop proche du banc entraînant un décollement du talon'],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 75
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Squat (Kettlebell ou Haltère)',
    category: 'strength',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'abs'],
    requiredEquipment: ['kettlebell'],
    alternativeExerciseIds: ['front-squat-barbell', 'back-squat-barbell'],
    setupCues: [
      'Kettlebell ou haltère tenu contre la poitrine avec les deux mains',
      'Pieds un peu plus larges que les hanches, orteils légèrement ouverts'
    ],
    executionCues: [
      'S accroupir en descendant les coudes entre les genoux',
      'Garder le torse droit et remonter en pressant fort dans le sol'
    ],
    breathingCues: 'Inspirer en descendant, expirer en remontant.',
    commonMistakes: ['Laisser la charge s éloigner de la poitrine'],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 60
  },
  {
    id: 'walking-lunges-dumbbells',
    name: 'Fentes Marchées (Haltères)',
    category: 'strength',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['back-squat-barbell', 'leg-press-45', 'bulgarian-split-squat'],
    setupCues: [
      'Debout, un haltère dans chaque main le long du corps',
      'Regard vers l avant, sangle abdominale verrouillée'
    ],
    executionCues: [
      'Faire un grand pas en avant et fléchir les deux genoux',
      'Descendre jusqu à ce que le genou arrière effleure le sol',
      'Genou avant au-dessus de la cheville (angle de 90 degrés)',
      'Pousser sur la jambe avant pour enchaîner directement sur le pas suivant'
    ],
    breathingCues: 'Inspirer à la descente de chaque fente, expirer lors de la propulsion.',
    commonMistakes: [
      'Pas trop court (le genou dépasse excessivement la pointe de pied avec talon qui décolle)',
      'Buste qui s écroule en avant'
    ],
    svgDiagramId: 'quadriceps',
    defaultRestSeconds: 60
  },

  // ==========================================
  // CHAÎNE POSTÉRIEURE : ISCHIO-JAMBIERS & FESSIERS
  // ==========================================
  {
    id: 'romanian-deadlift',
    name: 'Soulevé de Terre Roumain (Barre RDL)',
    category: 'strength',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back'],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['back-squat-barbell', 'stiff-leg-deadlift'],
    setupCues: [
      'Debout avec la barre tenue en pronation devant les cuisses',
      'Pieds largeur des hanches, genoux très légèrement déverrouillés (fixe)',
      'Épaules en arrière et cage thoracique ouverte'
    ],
    executionCues: [
      'Envoyer activement les fessiers vers l arrière comme pour fermer une porte',
      'Faire glisser la barre le long des cuisses et sous les genoux',
      'Ressentir un étirement puissant dans les ischio-jambiers',
      'Contracter vigoureusement les fessiers pour ramener le bassin en position debout'
    ],
    breathingCues: 'Inspirer au départ et pendant la descente, expirer lors du retour du bassin.',
    commonMistakes: [
      'Plier les genoux comme un squat classique (on perd la charnière de hanche)',
      'Arrondir la colonne vertébrale lombaire'
    ],
    svgDiagramId: 'hamstrings',
    defaultRestSeconds: 90
  },
  {
    id: 'hip-thrust-barbell',
    name: 'Hip Thrust au Banc (Barre)',
    category: 'strength',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'quadriceps'],
    requiredEquipment: ['barbell', 'bench'],
    alternativeExerciseIds: ['romanian-deadlift', 'back-squat-barbell'],
    setupCues: [
      'Haut du dos calé contre le bord d un banc d musculation, barre protégée sur le creux des hanches',
      'Pieds à plat au sol, tibias verticaux en position haute'
    ],
    executionCues: [
      'Pousser à travers les talons pour élever le bassin vers le plafond',
      'Rétroversion complète du bassin et verrouillage fessier au sommet (alignement genoux-hanches-épaules)',
      'Maintenir le menton rentré vers le torse sans cambrer le bas du dos'
    ],
    breathingCues: 'Expirer en montant le bassin, inspirer lors de la descente contrôlée.',
    commonMistakes: [
      'Hyper-extension lombaire au sommet en basculant la tête en arrière',
      'Pieds trop éloignés ou trop rapprochés'
    ],
    svgDiagramId: 'glutes',
    defaultRestSeconds: 90
  },
  {
    id: 'lying-leg-curl',
    name: 'Leg Curl Allongé (Machine Ischios)',
    category: 'strength',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    requiredEquipment: ['leg_press'],
    alternativeExerciseIds: ['romanian-deadlift'],
    setupCues: [
      'Allongé à plat ventre, boudin calé juste sous les mollets / tendons d Achille',
      'Genoux alignés avec le point de pivot de la machine, hanches plaquées'
    ],
    executionCues: [
      'Fléchir les talons vers les fessiers avec dynamisme',
      'Garder les hanches fermement collées au banc sans lever les fesses',
      'Ralentir la descente sur 2 à 3 secondes'
    ],
    breathingCues: 'Expirer en montant le boudin, inspirer en freinant la descente.',
    commonMistakes: ['Décoller le bassin du banc pour créer un effet de levier'],
    svgDiagramId: 'hamstrings',
    defaultRestSeconds: 60
  },
  {
    id: 'cable-glute-kickback',
    name: 'Kickback Fessier à la Poulie Basse',
    category: 'strength',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['hip-thrust-barbell'],
    setupCues: [
      'Sangle de cheville attachée à la poulie basse',
      'Buste incliné en appui sur les montants de la machine'
    ],
    executionCues: [
      'Pousser la jambe vers l arrière et légèrement vers le haut avec le talon',
      'Contracter le grand fessier en bloquant 1 seconde en arrière sans creuser le dos'
    ],
    breathingCues: 'Expirer en tendant la jambe en arrière, inspirer au retour.',
    commonMistakes: ['Cambrer la colonne lombaire pour monter la jambe plus haut'],
    svgDiagramId: 'glutes',
    defaultRestSeconds: 45
  },

  // ==========================================
  // MOLLETS
  // ==========================================
  {
    id: 'standing-calf-raise',
    name: 'Élévations Mollets Debout',
    category: 'strength',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    requiredEquipment: ['smith_machine'],
    alternativeExerciseIds: ['seated-calf-raise'],
    setupCues: [
      'Pointes de pieds sur une cale surélevée, talons dans le vide',
      'Jambes tendues sans hyperextension, charge sur les épaules ou à la Smith Machine'
    ],
    executionCues: [
      'Descendre les talons au maximum pour un étirement complet du triceps sural',
      'Monter sur la pointe des pieds de façon explosive et marquer 1 seconde au sommet'
    ],
    breathingCues: 'Expirer en montant sur les pointes, inspirer en descendant.',
    commonMistakes: ['Faire des rebonds rapides sans marquer l arrêt en bas'],
    svgDiagramId: 'calves',
    defaultRestSeconds: 60
  },
  {
    id: 'seated-calf-raise',
    name: 'Élévations Mollets Assis (Soléaire)',
    category: 'strength',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['standing-calf-raise'],
    setupCues: [
      'Assis sur un banc, haltères posés sur les genoux ou machine dédiée',
      'Pointes des pieds sur une cale'
    ],
    executionCues: [
      'Pousser sur la pointe des pieds avec amplitude maximale pour recruter le soléaire',
      'Contrôler la descente profonde'
    ],
    breathingCues: 'Expirer en montant, inspirer en bas.',
    commonMistakes: ['Amplitude tronquée'],
    svgDiagramId: 'calves',
    defaultRestSeconds: 45
  },

  // ==========================================
  // BRAS : BICEPS & AVANT-BRAS
  // ==========================================
  {
    id: 'biceps-curl-dumbbells',
    name: 'Curl Biceps Incliné / Debout (Haltères)',
    category: 'strength',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['hammer-curl-dumbbells', 'pullups-pronated'],
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
    id: 'hammer-curl-dumbbells',
    name: 'Curl Biceps Prise Marteau (Haltères)',
    category: 'strength',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    requiredEquipment: ['dumbbells'],
    alternativeExerciseIds: ['biceps-curl-dumbbells'],
    setupCues: [
      'Debout, un haltère dans chaque main en prise neutre (paumes face à face)',
      'Coudes verrouillés le long des flancs'
    ],
    executionCues: [
      'Monter les haltères sans faire de rotation des poignets pour cibler le brachial antérieur et le long supinateur',
      'Contrôler la descente sans relâcher la prise'
    ],
    breathingCues: 'Expirer en montant, inspirer en descendant.',
    commonMistakes: ['Prendre de l élan avec les épaules'],
    svgDiagramId: 'biceps',
    defaultRestSeconds: 60
  },
  {
    id: 'preacher-curl-bar',
    name: 'Curl Pupitre Larry Scott (Barre EZ)',
    category: 'strength',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    requiredEquipment: ['barbell'],
    alternativeExerciseIds: ['biceps-curl-dumbbells'],
    setupCues: [
      'Bras calés sur le pupitre incliné, aisselles bien calées en haut du support',
      'Prise largeur d épaules sur la barre'
    ],
    executionCues: [
      'Fléchir les avant-bras vers le visage avec isolation stricte du chef court du biceps',
      'Stopper la descente juste avant l extension complète pour protéger les tendons distaux'
    ],
    breathingCues: 'Expirer à la montée, inspirer à la descente.',
    commonMistakes: ['Hyperextension brutale des coudes en bas de course'],
    svgDiagramId: 'biceps',
    defaultRestSeconds: 60
  },

  // ==========================================
  // BRAS : TRICEPS
  // ==========================================
  {
    id: 'triceps-cable-pushdown',
    name: 'Extension Triceps à la Corde (Poulie)',
    category: 'strength',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['skull-crushers-bar', 'pushups-standard'],
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
  {
    id: 'skull-crushers-bar',
    name: 'Barre au Front (Skull Crushers)',
    category: 'strength',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    requiredEquipment: ['barbell', 'bench'],
    alternativeExerciseIds: ['triceps-cable-pushdown', 'overhead-cable-triceps'],
    setupCues: [
      'Allongé sur un banc plat, barre tenue bras tendus au-dessus du visage',
      'Bras inclinés légèrement en arrière (70-80° par rapport au sol) pour maintenir la tension'
    ],
    executionCues: [
      'Fléchir uniquement les avant-bras pour amener la barre vers le front ou derrière le crâne',
      'Garder les coudes serrés sans les laisser s écarter vers l extérieur',
      'Pousser pour revenir à la position de départ'
    ],
    breathingCues: 'Inspirer à la descente, expirer lors de l extension.',
    commonMistakes: ['Écarter les coudes en éventail provoquant des douleurs aux coudes'],
    svgDiagramId: 'triceps',
    defaultRestSeconds: 75
  },
  {
    id: 'overhead-cable-triceps',
    name: 'Extension Triceps au-dessus de la Tête (Poulie)',
    category: 'strength',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    requiredEquipment: ['cable_machine'],
    alternativeExerciseIds: ['skull-crushers-bar', 'triceps-cable-pushdown'],
    setupCues: [
      'Corde attachée à la poulie moyenne ou haute, dos à la machine',
      'Un pas en avant pour équilibrer le corps, bras fléchis derrière la nuque'
    ],
    executionCues: [
      'Déployer les avant-bras vers l avant et le haut pour étirer et contracter le chef long du triceps',
      'Conserver les coudes fixes et fermes'
    ],
    breathingCues: 'Expirer en étendant, inspirer en fléchissant.',
    commonMistakes: ['Cambrer le bas du dos sous la tension du câble'],
    svgDiagramId: 'triceps',
    defaultRestSeconds: 60
  },

  // ==========================================
  // ABDOMINAUX & TRONC (ANTI-EXTENSION & ROTATION)
  // ==========================================
  {
    id: 'plank-isometric',
    name: 'Gainage Planche Ventrale (Isométrique)',
    category: 'isometric',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['shoulders', 'glutes'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['ab-wheel-rollout', 'side-plank'],
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
  {
    id: 'side-plank',
    name: 'Gainage Latéral Isométrique',
    category: 'isometric',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['glutes', 'shoulders'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['plank-isometric'],
    setupCues: [
      'En appui latéral sur un avant-bras, coude à l aplomb de l épaule',
      'Pieds superposés ou décalés pour l appui'
    ],
    executionCues: [
      'Soulever le bassin pour aligner chevilles, hanches et tête en une ligne droite',
      'Contracter fortement les obliques et les fessiers sans laisser le bassin plonger'
    ],
    breathingCues: 'Respirations calmes et fluides.',
    commonMistakes: ['Rotation du buste vers le sol'],
    svgDiagramId: 'abs',
    defaultRestSeconds: 45
  },
  {
    id: 'hanging-leg-raise',
    name: 'Relevés de Jambes Suspendu à la Barre',
    category: 'strength',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['biceps'],
    requiredEquipment: ['pullup_bar'],
    alternativeExerciseIds: ['plank-isometric'],
    setupCues: [
      'Suspendu à une barre de traction en pronation, corps immobile',
      'Épaules actives (légèrement engagées pour protéger l articulation)'
    ],
    executionCues: [
      'Enrouler le bassin et monter les genoux ou jambes tendues vers la poitrine',
      'Penser à basculer le pubis vers le sternum pour un vrai recrutement des grands droits',
      'Redescendre lentement sans osciller'
    ],
    breathingCues: 'Expirer en montant les jambes, inspirer en redescendant.',
    commonMistakes: ['Prendre de l élan en balançant le corps d avant en arrière'],
    svgDiagramId: 'abs',
    defaultRestSeconds: 60
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Roulette Abdominale (Ab Wheel Rollout)',
    category: 'strength',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['back', 'shoulders'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['plank-isometric'],
    setupCues: [
      'À genoux, mains sur les poignées de la roulette sous les épaules',
      'Bassin rétroversé et abdominaux contractés en boule'
    ],
    executionCues: [
      'Faire rouler la roulette vers l avant en allongeant le corps sans jamais cambrer le dos',
      'Tirer avec les abdominaux et les grands dorsaux pour revenir à genoux'
    ],
    breathingCues: 'Inspirer en avançant, expirer avec puissance au retour.',
    commonMistakes: ['Laisser le bas du dos se creuser sous le poids du corps'],
    svgDiagramId: 'abs',
    defaultRestSeconds: 60
  },

  // ==========================================
  // ISOMÉTRIE & TESTS DE BASE
  // ==========================================
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
  },

  // ==========================================
  // CARDIO, MÉTABOLIQUE & CONDITIONNEMENT
  // ==========================================
  {
    id: 'rowing-machine-intervals',
    name: 'Rameur Concept2 (Intervalles Aérobies)',
    category: 'cardio',
    primaryMuscles: ['cardio', 'back', 'quadriceps'],
    secondaryMuscles: ['hamstrings', 'biceps'],
    requiredEquipment: ['cardio_machine'],
    alternativeExerciseIds: ['assault-bike-sprint', 'jump-rope'],
    setupCues: [
      'Pieds fermement sanglés sur les cale-pieds, talonnière ajustée',
      'Résistance du damper réglée entre 4 et 6',
      'Prise sur le palonnier mains détendues, dos droit'
    ],
    executionCues: [
      'Ordre de poussée : Jambes d abord, puis ouverture du tronc, puis tirage des bras vers les côtes',
      'Retour dans l ordre inverse : Tendre les bras, basculer le buste, puis fléchir les jambes',
      'Conserver une cadence stable de 24 à 28 coups/minute'
    ],
    breathingCues: 'Inspirer pendant le retour vers l avant, expirer avec puissance lors de la poussée des jambes.',
    commonMistakes: [
      'Plier les genoux avant que les bras ne soient passés devant au retour',
      'Tirer avec les bras avant d avoir poussé avec les jambes'
    ],
    svgDiagramId: 'cardio',
    defaultRestSeconds: 60
  },
  {
    id: 'assault-bike-sprint',
    name: 'Air Bike / Assault Bike (Intervalles)',
    category: 'cardio',
    primaryMuscles: ['cardio', 'quadriceps'],
    secondaryMuscles: ['shoulders', 'glutes'],
    requiredEquipment: ['cardio_machine'],
    alternativeExerciseIds: ['rowing-machine-intervals'],
    setupCues: [
      'Hauteur de selle réglée au niveau de la crête iliaque (légère flexion de genou en bas de pédale)',
      'Mains fermes sur les poignées mobiles'
    ],
    executionCues: [
      'Pousser et tirer vigoureusement sur les poignées tout en maintenant une cadence de pédalage élevée',
      'Garder le tronc stable sans balancer exagérément de gauche à droite'
    ],
    breathingCues: 'Ventilation rythmique et continue.',
    commonMistakes: ['N utiliser que les jambes en laissant les bras passifs'],
    svgDiagramId: 'cardio',
    defaultRestSeconds: 60
  },
  {
    id: 'kettlebell-swings',
    name: 'Kettlebell Swings (Puissance de Hanche)',
    category: 'cardio',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['back', 'cardio'],
    requiredEquipment: ['kettlebell'],
    alternativeExerciseIds: ['romanian-deadlift'],
    setupCues: [
      'Kettlebell posé 30 cm devant soi, pieds largeur d épaules',
      'Charnière de hanche active, basculer la charge entre les cuisses'
    ],
    executionCues: [
      'Propulser violemment les hanches vers l avant en contractant les fessiers',
      'Laisser flotter le kettlebell jusqu à hauteur des yeux grâce à l impulsion des hanches (pas des bras)',
      'Accueillir la charge au retour dans la charnière de hanche'
    ],
    breathingCues: 'Inspirer lors du passage entre les jambes, expiration brève et sonore lors du claquement de hanche.',
    commonMistakes: [
      'Faire un squat au lieu d une charnière de hanche',
      'Tirer la charge avec les bras et les épaules'
    ],
    svgDiagramId: 'glutes',
    defaultRestSeconds: 60
  },
  {
    id: 'jump-rope',
    name: 'Corde à Sauter (Cadence & Pliométrie)',
    category: 'cardio',
    primaryMuscles: ['cardio', 'calves'],
    secondaryMuscles: ['shoulders'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['rowing-machine-intervals'],
    setupCues: [
      'Corde ajustée (poignées aux aisselles quand on marche sur le milieu de la corde)',
      'Coudes près du corps, rotation initiée par les poignets'
    ],
    executionCues: [
      'Sautiller sur la pointe des pieds de 2 à 3 cm de haut seulement',
      'Amorti léger avec les chevilles et les mollets sans écraser les talons au sol'
    ],
    breathingCues: 'Respiration nasale ou buccale régulière.',
    commonMistakes: ['Sauter trop haut en pliant les genoux vers l arrière'],
    svgDiagramId: 'calves',
    defaultRestSeconds: 45
  },
  {
    id: 'burpees-athletic',
    name: 'Burpees Athlétiques (Conditionnement)',
    category: 'cardio',
    primaryMuscles: ['cardio', 'chest'],
    secondaryMuscles: ['quadriceps', 'abs'],
    requiredEquipment: ['bodyweight'],
    alternativeExerciseIds: ['assault-bike-sprint', 'jump-rope'],
    setupCues: [
      'Debout, pieds écartés de la largeur des épaules'
    ],
    executionCues: [
      'Poser les mains au sol et jeter les pieds en arrière en planche',
      'Poser la poitrine au sol avec contrôle',
      'Repousser le sol, ramener les pieds à plat et terminer par une extension verticale nette'
    ],
    breathingCues: 'Expirer lors de l extension vers le haut.',
    commonMistakes: ['Cambrer violemment le bas du dos en relevant le torse'],
    svgDiagramId: 'cardio',
    defaultRestSeconds: 60
  }
];
