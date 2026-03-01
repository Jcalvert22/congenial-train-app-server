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
  { name: 'Bike Ride', equipment: ['Cardio Bike'], muscle_group: 'Legs', howto: 'Pedal at a steady pace.', video: '' },
  {
    name: 'Leg Press',
    equipment: ['Machine'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Set feet shoulder-width on the sled, lower under control, then press back up.'
  },
  {
    name: 'Glute-Focused Leg Press',
    equipment: ['Machine'],
    muscle_group: 'Glutes',
    movement_pattern: 'Squat',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Place feet high and wide on the platform, lower slowly, and drive through heels.'
  },
  {
    name: 'Smith Machine Box Squat',
    equipment: ['Smith Machine', 'Bench'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Sit back to a box under the smith bar, lightly tap, then stand tall.'
  },
  {
    name: 'Goblet Split Squat',
    equipment: ['Dumbbells', 'Bench'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Hold a dumbbell at the chest, drop the back knee slowly, and stand up with control.'
  },
  {
    name: 'TRX Assisted Squat',
    equipment: ['Suspension Trainer'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Hold the straps, sit back into a squat, and use the handles lightly for balance.'
  },
  {
    name: 'Bodyweight Step-Up',
    equipment: ['Bench'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Step onto a low box, press through the front heel, then lower with control.'
  },
  {
    name: 'Dumbbell Step-Up',
    equipment: ['Bench', 'Dumbbells'],
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Hold light bells at sides, step up to the bench, and bring the trail leg up softly.'
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    equipment: ['Dumbbells'],
    muscle_group: 'Legs',
    movement_pattern: 'Hinge',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Hinge at the hips with soft knees, slide bells down thighs, then squeeze glutes to stand.'
  },
  {
    name: 'Smith Machine Romanian Deadlift',
    equipment: ['Smith Machine'],
    muscle_group: 'Glutes',
    movement_pattern: 'Hinge',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Stand under the smith bar, hinge with a flat back, and press hips forward to rise.'
  },
  {
    name: 'Cable Pull-Through',
    equipment: ['Cables'],
    muscle_group: 'Glutes',
    movement_pattern: 'Hinge',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Face away from the stack, hinge back with the rope between the legs, then stand tall.'
  },
  {
    name: 'Hip Thrust Machine',
    equipment: ['Machine'],
    muscle_group: 'Glutes',
    movement_pattern: 'Glutes',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Brace the upper back on the pad, drive hips up, and pause at the top before lowering.'
  },
  {
    name: 'Stability Ball Glute Bridge',
    equipment: ['Stability Ball'],
    muscle_group: 'Glutes',
    movement_pattern: 'Glutes',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Lie on the floor with calves on the ball, lift hips until aligned, then lower slowly.'
  },
  {
    name: 'Frog Pump',
    equipment: ['Bodyweight'],
    muscle_group: 'Glutes',
    movement_pattern: 'Glutes',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Lie on the floor with soles together, squeeze glutes to lift hips repeatedly.'
  },
  {
    name: 'Back Extension Machine',
    equipment: ['Machine'],
    muscle_group: 'Back',
    movement_pattern: 'Hinge',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Set the pad at hip level, lower the torso slowly, then extend to neutral.'
  },
  {
    name: 'Cable Kickback',
    equipment: ['Cables'],
    muscle_group: 'Glutes',
    movement_pattern: 'Glutes',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Attach an ankle cuff, kick the leg back with a soft knee, then return with control.'
  },
  {
    name: 'Standing Cable Hip Abduction',
    equipment: ['Cables'],
    muscle_group: 'Glutes',
    movement_pattern: 'Glutes',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Stand tall, sweep the strapped leg out to the side slowly, and resist on the return.'
  },
  {
    name: 'Mini Band Monster Walk',
    equipment: ['Mini Bands'],
    muscle_group: 'Glutes',
    movement_pattern: 'Glutes',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Place a loop above knees, sit into a mini squat, and step laterally with tension.'
  },
  {
    name: 'Chest Press Machine',
    equipment: ['Machine'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Sit tall, press the handles forward, and return until elbows are just past the torso.'
  },
  {
    name: 'Incline Chest Press Machine',
    equipment: ['Machine'],
    muscle_group: 'Upper Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Set the backrest upright, press handles on an upward path, and lower slowly.'
  },
  {
    name: 'Seated Cable Chest Press',
    equipment: ['Cables', 'Bench'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Sit with handles at chest height, press forward together, and reset with control.'
  },
  {
    name: 'Knee Push-up',
    equipment: ['Bodyweight'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Lower the chest toward the floor from the knees, then push the ground away.'
  },
  {
    name: 'Smith Machine Push-up',
    equipment: ['Smith Machine'],
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Place hands on the fixed bar, body in a plank, lower slowly, and press back up.'
  },
  {
    name: 'Seated Row Machine',
    equipment: ['Machine'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Sit tall, pull handles toward the ribs, pause, then extend arms without shrugging.'
  },
  {
    name: 'Chest-Supported Row',
    equipment: ['Bench', 'Dumbbells'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Lie face down on an incline bench and row dumbbells toward the hips.'
  },
  {
    name: 'Cable Row (Neutral Grip)',
    equipment: ['Cables'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Use a neutral handle, pull to the belly button, then reach forward under control.'
  },
  {
    name: 'Straight-Arm Pulldown',
    equipment: ['Cables'],
    muscle_group: 'Back',
    movement_pattern: 'Vertical Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Keep arms straight, pull the bar to thighs while squeezing lats, and return slowly.'
  },
  {
    name: 'Assisted Pull-Up Machine',
    equipment: ['Machine'],
    muscle_group: 'Back',
    movement_pattern: 'Vertical Pull',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Set assistance, pull the body upward with a proud chest, then lower steadily.'
  },
  {
    name: 'Single-Arm Cable Row',
    equipment: ['Cables'],
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Stagger your stance, row one handle toward the rib cage, and resist rotation.'
  },
  {
    name: 'Machine Shoulder Press',
    equipment: ['Machine'],
    muscle_group: 'Shoulders',
    movement_pattern: 'Vertical Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Press handles overhead with elbows under wrists, then lower to ear level.'
  },
  {
    name: 'Seated Dumbbell Shoulder Press',
    equipment: ['Bench', 'Dumbbells'],
    muscle_group: 'Shoulders',
    movement_pattern: 'Vertical Push',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Sit upright, press bells overhead with control, and lower until elbows are at 90 degrees.'
  },
  {
    name: 'Cable Lateral Raise',
    equipment: ['Cables'],
    muscle_group: 'Shoulders',
    movement_pattern: 'Vertical Push',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Stand beside a low pulley and sweep the arm out to shoulder height.'
  },
  {
    name: 'Supported Rear Delt Fly',
    equipment: ['Bench', 'Dumbbells'],
    muscle_group: 'Shoulders',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Chest on an incline bench, raise arms out wide to squeeze the rear shoulders.'
  },
  {
    name: 'Face Pull',
    equipment: ['Cables'],
    muscle_group: 'Shoulders',
    movement_pattern: 'Horizontal Pull',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Use a rope at eye level, pull toward the face with elbows high, and pause.'
  },
  {
    name: 'Cable Biceps Curl',
    equipment: ['Cables'],
    muscle_group: 'Arms',
    movement_pattern: 'Arms',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Stand tall, curl the straight bar to the shoulders, and lower with control.'
  },
  {
    name: 'Seated Dumbbell Curl',
    equipment: ['Bench', 'Dumbbells'],
    muscle_group: 'Arms',
    movement_pattern: 'Arms',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Sit upright with back support, curl bells while keeping elbows tucked.'
  },
  {
    name: 'Cable Hammer Curl',
    equipment: ['Cables'],
    muscle_group: 'Arms',
    movement_pattern: 'Arms',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Grip the rope with thumbs up, curl toward the shoulders, then lower steadily.'
  },
  {
    name: 'Rope Overhead Triceps Extension',
    equipment: ['Cables'],
    muscle_group: 'Arms',
    movement_pattern: 'Arms',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Face away from the stack, extend the rope overhead, and control the stretch behind the head.'
  },
  {
    name: 'Cable Triceps Kickback',
    equipment: ['Cables'],
    muscle_group: 'Arms',
    movement_pattern: 'Arms',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Hinge slightly, tuck the elbow, and extend the handle back until the arm is straight.'
  },
  {
    name: 'Dead Bug',
    equipment: ['Bodyweight'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Lie on the back, lower opposite arm and leg slowly while keeping ribs down.'
  },
  {
    name: 'Bird Dog',
    equipment: ['Bodyweight'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'From hands and knees, reach opposite arm and leg long without twisting.'
  },
  {
    name: 'Pallof Press',
    equipment: ['Cables', 'Resistance Bands'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Stand perpendicular to the anchor, press the handle forward, resisting rotation.'
  },
  {
    name: 'Machine Crunch',
    equipment: ['Machine'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Set the seat, curl the torso forward against the pad, then return slowly.'
  },
  {
    name: 'Cable Crunch',
    equipment: ['Cables'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'moderate',
    gymxiety_safe: true,
    howto: 'Kneel with a rope overhead, pull ribs toward hips, and control the ascent.'
  },
  {
    name: 'Side Plank',
    equipment: ['Bodyweight'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Stack feet, lift hips off the floor, and hold a straight line from head to heels.'
  },
  {
    name: 'Stability Ball Plank',
    equipment: ['Stability Ball'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Place forearms on the ball, brace the core, and hold without letting hips sag.'
  },
  {
    name: 'Treadmill Incline Walk',
    equipment: ['Treadmill'],
    muscle_group: 'Legs',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Set a light incline and walk at a conversational pace for steady cardio.'
  },
  {
    name: 'Row Machine Easy Pace',
    equipment: ['Rowing Machine'],
    muscle_group: 'Back',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Row with a smooth rhythm, focusing on long strokes and relaxed breathing.'
  },
  {
    name: 'Recumbent Bike Ride',
    equipment: ['Recumbent Bike'],
    muscle_group: 'Legs',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Sit back in the seat, keep light tension on the pedals, and spin comfortably.'
  },
  {
    name: 'Light Elliptical Glide',
    equipment: ['Elliptical'],
    muscle_group: 'Legs',
    movement_pattern: 'Conditioning',
    intimidation_level: 'low',
    gymxiety_safe: true,
    howto: 'Maintain an easy stride on the elliptical, keeping heels flat and posture tall.'
  },
  {
    name: 'Suitcase Carry',
    equipment: ['Dumbbells'],
    muscle_group: 'Abs',
    movement_pattern: 'Core',
    intimidation_level: 'moderate',
    gymxiety_safe: false,
    howto: 'Hold a single dumbbell at your side and walk slowly while keeping the torso upright.'
  }
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
