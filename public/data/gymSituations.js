export const GYM_SITUATIONS = [
  {
    id: 'someone_waiting',
    title: 'Someone is waiting for your machine',
    tip: 'Finish your set, then offer to alternate. You do not need to rush - just stay aware.'
  },
  {
    id: 'work_in_request',
    title: 'You want to work in with someone',
    tip: 'Wait for a pause and ask, "Mind if I work in between sets?" Most people say yes.'
  },
  {
    id: 'equipment_taken',
    title: 'Someone is using the equipment you need',
    tip: 'Check how many sets they have left. If it is several, choose an alternative.'
  },
  {
    id: 'machine_confusion',
    title: 'You are unsure how to adjust a machine',
    tip: 'Look at the diagram or ask for help - people enjoy helping with machines.'
  },
  {
    id: 'feeling_watched',
    title: 'You feel like people are watching you',
    tip: 'Most people are focused on themselves. A slow, controlled tempo looks confident.'
  },
  {
    id: 'cleaning_equipment',
    title: 'You need to clean equipment',
    tip: 'Wipe the seat and handles. It takes a few seconds and everyone appreciates it.'
  },
  {
    id: 'dumbbell_space',
    title: 'You are unsure where to stand with dumbbells',
    tip: 'Stand a few feet back from the rack so others can grab weights.'
  },
  {
    id: 'rest_time',
    title: 'You are unsure how long to rest',
    tip: '60-90 seconds is standard. If someone is waiting, lean shorter.'
  },
  {
    id: 'switching_attachments',
    title: 'You need to switch cable attachments',
    tip: 'Unclip the handle, hang it up, and clip yours on. Totally normal.'
  },
  {
    id: 'taking_too_long',
    title: 'You worry about taking too long',
    tip: 'As long as you are doing your sets and not sitting on equipment, you are fine.'
  },
  {
    id: 'moving_plates',
    title: 'You need to move someone\'s plates',
    tip: 'Ask, "Are you using this?" If not, it is yours to use.'
  },
  {
    id: 'warming_up',
    title: 'You are unsure where to warm up',
    tip: 'Use an open floor space or free bench and keep movements compact.'
  }
];

export const getGymSituationById = id => GYM_SITUATIONS.find(entry => entry.id === id) || null;
