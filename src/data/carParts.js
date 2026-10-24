/**
 * Car parts mapping for the "Oil Change Experience".
 *
 * When /public/models/car.glb loads, every mesh name is printed in the browser console
 * (open DevTools → Console, look for "[car] mesh names"). Copy the names you need into
 * the `keywords` lists below. Matching is case-insensitive and checks the mesh name AND
 * the names of its parent nodes, so naming a parent node "Door_FL" is enough.
 *
 * The first group whose keyword matches wins, so keep the order below.
 * Meshes that match nothing still explode, using the generic "away from the center" logic.
 * If car.glb is missing, a procedural sedan with the same part names is used instead.
 */
export const carPartsConfig = {
  modelPath: 'models/car.glb',

  // Scale the model so its length (longest side) becomes this many meters.
  targetLength: 4.8,

  // Direction the car's nose points to after loading: '+z', '-z', '+x' or '-x'.
  forward: '+z',

  groups: [
    // `explode` = how far (meters) the parts of this group fly out. 0 = the part stays put.
    { key: 'body', keywords: ['body', 'chassis', 'shell', 'frame'], explode: 0 },
    { key: 'hood', keywords: ['hood', 'bonnet'], explode: 1.6 },
    { key: 'trunk', keywords: ['trunk', 'boot', 'tailgate'], explode: 1.3 },
    { key: 'doors', keywords: ['door'], explode: 1.3 },
    { key: 'wheels', keywords: ['wheel', 'tire', 'tyre', 'rim'], explode: 1.5 },
    { key: 'bumpers', keywords: ['bumper'], explode: 1.2 },
    { key: 'engine', keywords: ['engine', 'motor', 'block'], explode: 1.0 },
    { key: 'lightsFront', keywords: ['headlight', 'head_light', 'headlamp'], explode: 0.9 },
    { key: 'lightsRear', keywords: ['taillight', 'tail_light', 'taillamp', 'rearlight'], explode: 0.9 },
    { key: 'glass', keywords: ['glass', 'window', 'windshield', 'windscreen'], explode: 0.8 },
    { key: 'mirrors', keywords: ['mirror'], explode: 1.0 },
    { key: 'grille', keywords: ['grille', 'grill'], explode: 1.0 }
  ],

  // Distance used for meshes that matched no group.
  defaultExplode: 1.1,

  // The hood rotates around its rear edge when it opens (degrees).
  hoodOpenAngle: 62,

  // Where the oil is poured. If no mesh matches, the top of the engine (or the hood area) is used.
  oilCapKeywords: ['oil_cap', 'oilcap', 'oil_filler', 'filler'],

  // Where the exhaust smoke comes from. If no mesh matches, the rear-left bottom corner is used.
  exhaustKeywords: ['exhaust', 'muffler', 'tailpipe']
};
