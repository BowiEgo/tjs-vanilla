import { StageConstructor } from './type';
import IsometricRoomStage from './IsometricRoom';

export const stageNames = ['IsometricRoom'] as const;

const Stages: { [key: string]: StageConstructor } = {
	IsometricRoomStage,
};

export default Stages;
