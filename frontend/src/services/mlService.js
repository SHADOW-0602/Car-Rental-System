import * as tf from '@tensorflow/tfjs';

/**
 * Predict ETA in minutes.
 * @param {number} distanceKm
 * @param {number} avgSpeedKmh
 * @returns {number} ETA (minutes)
 */
export async function predictEta(distanceKm, avgSpeedKmh) {
  if (!distanceKm || !avgSpeedKmh) return null;
  const etaHours = distanceKm / avgSpeedKmh;
  return Math.round(etaHours * 60);
}

/**
 * Train a simple regression model to map distance to ETA.
 */
export async function trainExampleModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]); // Distances in km
  const ys = tf.tensor2d([5, 10, 15, 20], [4, 1]); // ETAs in mins

  await model.fit(xs, ys, { epochs: 100 });
  return model;
}