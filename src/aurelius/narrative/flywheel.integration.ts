import {
  FlywheelIntegrationManifest,
  type StrategicLearningLoopInput,
} from "@/aurelius/flywheel";

export function runFlywheelLearningCycle(input: StrategicLearningLoopInput) {
  const manifest = new FlywheelIntegrationManifest();
  return manifest.run(input);
}

