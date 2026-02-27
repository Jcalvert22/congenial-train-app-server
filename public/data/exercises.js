export const MUSCLE_GROUPS = [
  'Upper Chest',
  'Chest',
  'Shoulders',
  'Arms',
  'Back',
  'Abs',
  'Legs'
];

export const EQUIPMENT_LIST = [
  'Bench',
  'Pec Deck',
  'Dumbbells',
  'Cables',
  'Lat Pulldown',
  'Seated Row',
  'Shoulder Press',
  'Preacher Curl',
  'Squat Rack',
  'Leg Extension',
  'Hamstring Curl',
  'Treadmill',
  'Stair Stepper',
  'Cardio Bike'
];

export const EXERCISES = [
  { name: 'Incline Dumbbell Press', equipment: ['Bench', 'Dumbbells'], muscle_group: 'Upper Chest', howto: 'Lie on an incline bench and press dumbbells upward.', video: '' },
  { name: 'Incline Push-up', equipment: ['Bench'], muscle_group: 'Upper Chest', howto: 'Place hands on bench, feet on floor, and perform push-ups.', video: '' },
  { name: 'Push-up', equipment: ['Bench', 'Dumbbells'], muscle_group: 'Chest', howto: 'Start in a plank position and lower your body until your chest nearly touches the floor, then push back up.', video: '' },
  { name: 'Bench Press', equipment: ['Bench', 'Dumbbells'], muscle_group: 'Chest', howto: 'Lie on a bench, grip dumbbells. Lower to chest, then press up.', video: '' },
  { name: 'Pec Deck Fly', equipment: ['Pec Deck'], muscle_group: 'Chest', howto: 'Sit at the machine, bring arms together in front of chest, then return.', video: '' },
  { name: 'Cable Chest Fly', equipment: ['Cables'], muscle_group: 'Chest', howto: 'With arms slightly bent, bring handles together in a wide arc, then return.', video: '' },
  { name: 'Shoulder Press', equipment: ['Shoulder Press', 'Dumbbells'], muscle_group: 'Shoulders', howto: 'Press weight overhead, then lower.', video: '' },
  { name: 'Lateral Raise', equipment: ['Dumbbells', 'Cables'], muscle_group: 'Shoulders', howto: 'Raise weights to sides to shoulder height.', video: '' },
  { name: 'Front Raise', equipment: ['Dumbbells', 'Cables'], muscle_group: 'Shoulders', howto: 'Raise weights in front to shoulder height.', video: '' },
  { name: 'Bicep Curl', equipment: ['Dumbbells', 'Preacher Curl', 'Cables'], muscle_group: 'Arms', howto: 'Curl weights up while keeping elbows close, then lower slowly.', video: '' },
  { name: 'Triceps Pushdown', equipment: ['Cables'], muscle_group: 'Arms', howto: 'Push bar or rope down, keeping elbows at sides.', video: '' },
  { name: 'Hammer Curl', equipment: ['Dumbbells'], muscle_group: 'Arms', howto: 'Curl dumbbells with palms facing each other.', video: '' },
  { name: 'Overhead Triceps Extension', equipment: ['Dumbbells'], muscle_group: 'Arms', howto: 'Extend dumbbell overhead, then lower behind head and press up.', video: '' },
  { name: 'Lat Pulldown', equipment: ['Lat Pulldown', 'Cables'], muscle_group: 'Back', howto: 'Pull bar to chest, then release.', video: '' },
  { name: 'Seated Row', equipment: ['Cables'], muscle_group: 'Back', howto: 'Pull handles to torso, then release.', video: '' },
  { name: 'Dumbbell Row', equipment: ['Bench', 'Dumbbells'], muscle_group: 'Back', howto: 'Place one knee and hand on bench, row dumbbell to hip.', video: '' },
  { name: 'Crunch', equipment: ['Bench'], muscle_group: 'Abs', howto: 'Curl shoulders toward hips, then lower.', video: '' },
  { name: 'Plank', equipment: ['Bench'], muscle_group: 'Abs', howto: 'Hold body straight on elbows and toes.', video: '' },
  { name: 'Leg Raise', equipment: ['Bench'], muscle_group: 'Abs', howto: 'Lie on bench, raise legs upward, then lower.', video: '' },
  { name: 'Squat', equipment: ['Squat Rack', 'Dumbbells'], muscle_group: 'Legs', howto: 'Lower hips back and down, then stand up.', video: '' },
  { name: 'Leg Extension', equipment: ['Leg Extension'], muscle_group: 'Legs', howto: 'Extend knees to lift pad.', video: '' },
  { name: 'Hamstring Curl', equipment: ['Hamstring Curl'], muscle_group: 'Legs', howto: 'Curl heels toward glutes.', video: '' },
  { name: 'Calf Raise', equipment: ['Bench', 'Dumbbells'], muscle_group: 'Legs', howto: 'Stand on edge of bench, raise heels, then lower.', video: '' },
  { name: 'Treadmill Walk', equipment: ['Treadmill'], muscle_group: 'Legs', howto: 'Walk at a steady pace.', video: '' },
  { name: 'Stair Stepper', equipment: ['Stair Stepper'], muscle_group: 'Legs', howto: 'Climb rotating stairs.', video: '' },
  { name: 'Bike Ride', equipment: ['Cardio Bike'], muscle_group: 'Legs', howto: 'Pedal at a steady pace.', video: '' }
];

export const BEGINNER_EQUIPMENT = [
  'Dumbbells',
  'Bench',
  'Bodyweight Only',
  'Resistance Bands',
  'Pull-up Bar',
  'Stationary Bike',
  'Treadmill',
  'Kettlebell',
  'StepMill',
  'Jump Rope',
  'Foam Roller',
  'Stability Ball',
  'Mini Bands',
  'Push-up Handles',
  'Grip Trainer',
  'Medicine Ball',
  'Ab Wheel',
  'Parallettes',
  'Suspension Trainer',
  'Roman Chair',
  'Hyperextension Bench',
  'Stepper',
  'Elliptical',
  'Rowing Machine',
  'Weighted Vest',
  'Ankle Weights',
  'Bosu Ball'
];

export const BEGINNER_MUSCLES = [...MUSCLE_GROUPS];

export const BASIC_EXERCISES = [
  { name: 'Push-up', equipment: ['Bodyweight'], muscle_group: 'Chest' },
  { name: 'Squat', equipment: ['Bodyweight', 'Barbell', 'Dumbbells'], muscle_group: 'Legs' },
  { name: 'Bench Press', equipment: ['Barbell', 'Bench', 'Dumbbells'], muscle_group: 'Chest' },
  { name: 'Deadlift', equipment: ['Barbell', 'Dumbbells'], muscle_group: 'Back' },
  { name: 'Pull-up', equipment: ['Pull-up Bar'], muscle_group: 'Back' },
  { name: 'Kettlebell Swing', equipment: ['Kettlebell'], muscle_group: 'Legs' },
  { name: 'Banded Row', equipment: ['Resistance Bands'], muscle_group: 'Back' },
  { name: 'Running', equipment: ['Treadmill'], muscle_group: 'Legs' },
  { name: 'Cycling', equipment: ['Stationary Bike'], muscle_group: 'Legs' }
];
