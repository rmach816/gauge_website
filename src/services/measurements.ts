import { UserMeasurements, GarmentType } from '../types';

export const MeasurementsService = {
  calculateShirtSize(measurements: UserMeasurements): string {
    const { neck, sleeve } = measurements;
    return `${neck}" / ${sleeve}"`;
  },

  calculateJacketSize(measurements: UserMeasurements): string {
    const { chest, height } = measurements;
    
    let length = 'R';
    if (height < 67) length = 'S';
    else if (height > 73) length = 'L';
    
    return `${chest}${length}`;
  },

  calculatePantsSize(measurements: UserMeasurements): string {
    const { waist, inseam } = measurements;
    return `${waist}x${inseam}`;
  },

  getRecommendedSize(
    garmentType: GarmentType,
    measurements: UserMeasurements
  ): string {
    switch (garmentType) {
      case GarmentType.SHIRT:
        return this.calculateShirtSize(measurements);
      case GarmentType.JACKET:
        return this.calculateJacketSize(measurements);
      case GarmentType.PANTS:
        return this.calculatePantsSize(measurements);
      default:
        return 'See size guide';
    }
  },

  getFitAdvice(measurements: UserMeasurements): string[] {
    const advice: string[] = [];
    const { height, weight, chest, waist } = measurements;
    
    const heightInMeters = (height * 2.54) / 100;
    const weightInKg = weight * 0.453592;
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const ratio = chest / waist;
    
    if (bmi < 18.5) {
      advice.push('Look for slim or tailored fits');
      advice.push('Layering can add visual bulk');
    } else if (bmi > 30) {
      advice.push('Classic or relaxed fits will be most comfortable');
    }
    
    if (ratio > 1.3) {
      advice.push('Your athletic build looks great in fitted styles');
    }
    
    if (height < 67) {
      advice.push('Look for shorter inseams and jacket lengths');
    } else if (height > 75) {
      advice.push('Look for tall sizes with longer sleeves');
    }
    
    return advice;
  },

  validateMeasurements(measurements: Partial<UserMeasurements>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (measurements.height && (measurements.height < 48 || measurements.height > 96)) {
      errors.push('Height must be between 4\'0" and 8\'0"');
    }
    
    if (measurements.weight && (measurements.weight < 80 || measurements.weight > 500)) {
      errors.push('Weight must be between 80 and 500 lbs');
    }
    
    if (measurements.chest && (measurements.chest < 30 || measurements.chest > 60)) {
      errors.push('Chest measurement seems unusual');
    }
    
    if (measurements.waist && (measurements.waist < 24 || measurements.waist > 60)) {
      errors.push('Waist measurement seems unusual');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

