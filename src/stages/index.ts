import { StageConstructor } from './type';
import CarRadarStage from './CarRadar';
import IsometricRoomStage from './IsometricRoom';

export const stageNames = ['IsometricRoom'] as const;

const Stages: { [key: string]: StageConstructor } = {
	IsometricRoomStage,
	CarRadarStage,
};

export default Stages;

export { IsometricRoomStage, CarRadarStage };
