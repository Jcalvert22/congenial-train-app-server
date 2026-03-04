export const EQUIPMENT_ETIQUETTE = {
  barbell: 'Re-rack your plates so the next person can set up quickly.',
  dumbbell: 'Return dumbbells to the rack and give others space to lift.',
  machine: 'Wipe the seat and handles and reset the pin to a light weight.',
  cable: 'Return the handle to the hook and lower the weight gently.',
  bodyweight: 'Choose a spot that doesn’t block equipment or walkways.',
  band: 'Return bands to their hook and avoid stretching them across walkways.',
  bench: 'Wipe the bench and avoid sitting on it between sets if someone is waiting.',
  smith_machine: 'Unload the bar when finished and leave the safety stops in a neutral position.',
  squat_rack: 'Re-rack plates in order and keep the area clear of loose weights.',
  cardio: 'Wipe the console and handles and step off promptly during busy hours.'
};

export const getEquipmentEtiquette = equipment => EQUIPMENT_ETIQUETTE[equipment] || null;
