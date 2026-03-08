const MACHINE_ICON_FILENAMES = {
  ab_crunch: 'ab-crunch.svg',
  calf_raise_seated: 'calf-raise.svg',
  calf_raise_standing: 'calf-raise.svg',
  chest_fly: 'pec-deck.svg',
  chest_press: 'chest-press.svg',
  dip_press: 'chest-press.svg',
  glute_bridge: 'glute-bridge.svg',
  glute_kickback: 'glute-kickback.svg',
  hack_squat: 'leg-press.svg',
  hip_abduction: 'hip-abduction.svg',
  hip_thrust: 'hip_thrust_side_icon_v2.svg',
  lat_pulldown: 'lat-pulldown.svg',
  lateral_raise: 'shoulder-press.svg',
  leg_curl: 'leg-curl.svg',
  leg_extension: 'leg-extension.svg',
  leg_press: 'leg-press.svg',
  pullover: 'pullover.svg',
  preacher_curl: 'preacher-curl.svg',
  rotary_torso: 'rotary-torso.svg',
  seated_row: 'seated-row.svg',
  shoulder_press: 'shoulder-press.svg',
  smith_machine: 'smith_machine_icon_v2.svg',
  step_up: 'leg-press.svg',
  tricep_extension: 'tricep-pushdown.svg',
  tricep_pushdown: 'tricep-pushdown.svg'
};

function resolveMachineIcon(filename) {
  return new URL(`../assets/icons/machines/${filename}`, import.meta.url).href;
}

export const machineIcons = Object.fromEntries(
  Object.entries(MACHINE_ICON_FILENAMES).map(([key, filename]) => [key, resolveMachineIcon(filename)])
);
