export const GENERAL_EQUIPMENT = [
  'Bodyweight',
  'Dumbbells',
  'Cables',
  'Bench',
  'Squat Rack',
  'Bands',
  'Cardio Machines'
];

export const MACHINE_EQUIPMENT = [
  'Chest Press Machine',
  'Pec Deck Machine',
  'Lat Pulldown Machine',
  'Seated Row Machine',
  'Leg Press Machine',
  'Hamstring Curl Machine',
  'Ab Curl Machine',
  'Rotary Torso Machine',
  'Assisted Dip Machine',
  'Pull-Up Bar (Bodyweight)'
];

export const EQUIPMENT_ETIQUETTE = {
  'Chest Press Machine': "Adjust the seat - it's normal.",
  'Pec Deck Machine': 'Set the pads where you need them - everyone adjusts this one.',
  'Lat Pulldown Machine': 'Keep the bar steady - no need to lean back far.',
  'Seated Row Machine': 'Sit tall and pull smoothly - no rushing needed.',
  'Leg Press Machine': 'Adjust the seat depth so it feels comfortable.',
  'Hamstring Curl Machine': 'Make sure the pad sits just above your ankles.',
  'Ab Curl Machine': 'Use a light weight and move slow.',
  'Rotary Torso Machine': 'Choose a small range of motion - no need to twist far.',
  'Assisted Dip Machine': 'Pick a weight that helps you.',
  'Pull-Up Bar (Bodyweight)': 'Give others a little space when possible.',
  Dumbbells: 'Step back from the rack before lifting.',
  Cables: "Reset the attachment when you're done.",
  Bench: 'Try not to block the mirror behind you.',
  'Squat Rack': "Take your time setting up - you're allowed to.",
  Bands: 'Secure the anchor so it stays safe for others.',
  'Cardio Machines': 'Step off to the side if you need a break.',
  Bodyweight: 'Give others a little space when possible.'
};

export const GYMXIETY_ETIQUETTE = {
  Machines: "It's okay to take your time adjusting the seat.",
  Dumbbells: "Find a small space - you don't need much room.",
  'Squat Rack': 'You belong here. Everyone starts somewhere.',
  Bench: "It's okay to move the bench a little."
};

export const EQUIPMENT_LIST = [...GENERAL_EQUIPMENT, ...MACHINE_EQUIPMENT];
export const FALLBACK_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Cables'];
export const MUSCLE_GROUPS = ['Chest', 'Back', 'Arms', 'Legs', 'Glutes', 'Core', 'Cardio'];

export const EXERCISES = [
  // Chest
  {
    name: 'Chest Press Machine',
    equipment: ['Chest Press Machine'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: "Adjust the seat - it's normal."
  },
  {
    name: 'Pec Deck Fly',
    equipment: ['Pec Deck Machine'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Set the pads where you need them - everyone adjusts this one.'
  },
  {
    name: 'Cable Chest Fly',
    equipment: ['Cables'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Step a little forward so the cable lane stays clear.'
  },
  {
    name: 'Kneeling Push-Up',
    equipment: ['Bodyweight'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Use a mat and leave space for others nearby.'
  },
  {
    name: 'Dumbbell Floor Press',
    equipment: ['Dumbbells'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Claim a corner of the floor so walkways stay open.'
  },

  // Back
  {
    name: 'Lat Pulldown Machine',
    equipment: ['Lat Pulldown Machine'],
    muscle_group: 'Back',
    movement_pattern: 'Vertical Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Keep the bar steady - no need to lean back far.'
  },
  {
    name: 'Seated Row Machine',
    equipment: ['Seated Row Machine'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Sit tall and pull smoothly - no rushing needed.'
  },
  {
    name: 'Single-Arm Dumbbell Row',
    equipment: ['Dumbbells'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Re-rack the dumbbell before wiping the bench.'
  },
  {
    name: 'Band Row',
    equipment: ['Bands'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Unclip the band so the anchor point is free when you finish.'
  },
  {
    name: 'Pull-Up Bar Hang',
    equipment: ['Pull-Up Bar (Bodyweight)'],
    muscle_group: 'Back',
    movement_pattern: 'Vertical Pull',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    etiquette_tip: 'Give others a little space when possible.'
  },
  {
    name: 'Cable Face Pull',
    equipment: ['Cables'],
    muscle_group: 'Back',
    movement_pattern: 'Accessory',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Lower the rope gently and reset the height when done.'
  },

  // Arms
  {
    name: 'Cable Biceps Curl',
    equipment: ['Cables'],
    muscle_group: 'Arms',
    movement_pattern: 'Accessory',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Share the cable by alternating if someone is waiting.'
  },
  {
    name: 'Dumbbell Hammer Curl',
    equipment: ['Dumbbells'],
    muscle_group: 'Arms',
    movement_pattern: 'Accessory',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Carry the dumbbells a few steps from the rack before curling.'
  },
  {
    name: 'Cable Triceps Pushdown',
    equipment: ['Cables'],
    muscle_group: 'Arms',
    movement_pattern: 'Accessory',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Set the pin back to a lighter weight for the next lifter.'
  },
  {
    name: 'Bench Triceps Dip',
    equipment: ['Bench'],
    muscle_group: 'Arms',
    movement_pattern: 'Accessory',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Leave room behind the bench so people can walk by.'
  },
  {
    name: 'Assisted Dip Machine',
    equipment: ['Assisted Dip Machine'],
    muscle_group: 'Arms',
    movement_pattern: 'Accessory',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Pick a weight that helps you.'
  },

  // Legs
  {
    name: 'Leg Press Machine',
    equipment: ['Leg Press Machine'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Adjust the seat depth so it feels comfortable.'
  },
  {
    name: 'Hamstring Curl Machine',
    equipment: ['Hamstring Curl Machine'],
    muscle_group: 'Legs',
    movement_pattern: 'Hinge',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Make sure the pad sits just above your ankles.'
  },
  {
    name: 'Goblet Squat',
    equipment: ['Dumbbells'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Set the dumbbell down softly so the floor stays clear.'
  },
  {
    name: 'Step-Up',
    equipment: ['Bench'],
    muscle_group: 'Legs',
    movement_pattern: 'Lunge',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Return the bench to flat once you finish stepping.'
  },
  {
    name: 'Bodyweight Split Squat',
    equipment: ['Bodyweight'],
    muscle_group: 'Legs',
    movement_pattern: 'Lunge',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Face one direction so you do not block traffic.'
  },
  {
    name: 'Rack Supported Squat Hold',
    equipment: ['Squat Rack'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    etiquette_tip: 'Share the rack by stepping aside during rest.'
  },
  {
    name: 'Banded Terminal Knee Extension',
    equipment: ['Bands'],
    muscle_group: 'Legs',
    movement_pattern: 'Accessory',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Step slightly to the side so the stretched band is not a trip hazard.'
  },

  // Glutes
  {
    name: 'Glute Bridge',
    equipment: ['Bodyweight'],
    muscle_group: 'Glutes',
    movement_pattern: 'Hinge',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Use a mat or towel and wipe it down afterward.'
  },
  {
    name: 'Cable Pull-Through',
    equipment: ['Cables'],
    muscle_group: 'Glutes',
    movement_pattern: 'Hinge',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Face away from the stack so the cable path stays open.'
  },
  {
    name: 'Band Monster Walk',
    equipment: ['Bands'],
    muscle_group: 'Glutes',
    movement_pattern: 'Carry',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Pick a short lane and turn around instead of wandering.'
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    equipment: ['Dumbbells'],
    muscle_group: 'Glutes',
    movement_pattern: 'Hinge',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Set dumbbells down quietly before resetting your grip.'
  },

  // Core
  {
    name: 'Dead Bug',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Stay centered on your mat so others have room.'
  },
  {
    name: 'Plank',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Roll out a mat and keep your space tidy.'
  },
  {
    name: 'Side Plank',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Face one direction so walkways stay open.'
  },
  {
    name: 'Mountain Climbers',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    etiquette_tip: 'Stay in one lane so no one has to step over you.'
  },
  {
    name: 'Bird Dog',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Choose a lane on the turf so you are not blocking anyone.'
  },
  {
    name: 'Hollow Hold',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Use a mat and lower slowly so it stays quiet.'
  },
  {
    name: 'Bicycle Crunches',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Keep the motion compact so you do not kick nearby people.'
  },
  {
    name: 'Flutter Kicks',
    equipment: ['Bodyweight'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Stay on your mat and keep shoes away from others.'
  },
  {
    name: 'Pallof Press',
    equipment: ['Cables'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Stand perpendicular to the stack so the cable lane is clear.'
  },
  {
    name: 'Plank on Bench',
    equipment: ['Bench'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Leave enough space behind the bench for people to pass.'
  },
  {
    name: 'Ab Curl Machine Crunch',
    equipment: ['Ab Curl Machine'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Use a light weight and move slow.'
  },
  {
    name: 'Rotary Torso Machine Twist',
    equipment: ['Rotary Torso Machine'],
    muscle_group: 'Core',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Choose a small range of motion - no need to twist far.'
  },

  // Cardio
  {
    name: 'Low-Impact March',
    equipment: ['Bodyweight'],
    muscle_group: 'Cardio',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Face the same direction so others can pass behind you.'
  },
  {
    name: 'Treadmill Walk',
    equipment: ['Cardio Machines'],
    muscle_group: 'Cardio',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Step off to the side if you need a break.'
  },
  {
    name: 'Bike',
    equipment: ['Cardio Machines'],
    muscle_group: 'Cardio',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Towel off the seat and handles before leaving.'
  },
  {
    name: 'Elliptical Glide',
    equipment: ['Cardio Machines'],
    muscle_group: 'Cardio',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Let others know if you will return before you step away.'
  },
  {
    name: 'Rower',
    equipment: ['Cardio Machines'],
    muscle_group: 'Cardio',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    etiquette_tip: 'Slide the seat forward and wipe the handle when done.'
  }
];

const DEFAULT_WORKOUT_NAMES = [
  'Goblet Squat',
  'Bodyweight Split Squat',
  'Cable Chest Fly',
  'Single-Arm Dumbbell Row',
  'Cable Biceps Curl',
  'Cable Triceps Pushdown',
  'Glute Bridge',
  'Dead Bug',
  'Low-Impact March'
];

export const DEFAULT_BEGINNER_WORKOUT = DEFAULT_WORKOUT_NAMES
  .map(name => EXERCISES.find(exercise => exercise.name === name))
  .filter(Boolean);

export const BEGINNER_EQUIPMENT = [...EQUIPMENT_LIST];
export const BEGINNER_MUSCLES = [...MUSCLE_GROUPS];
