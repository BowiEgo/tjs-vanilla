import { Texture } from 'three';
import { stageNames } from '.';
import Stage from './Stage';

interface StageConstructor {
	new (): Stage;
}

/**
 * {@link ExtractByString}
 * @example type Key = ExtractByString<"a">  =>  type Key = "a"
 */
type ExtractByString<S extends string> = S extends `${infer R}` ? R : S;

/**
 * {@link StageName}
 */
type StageName = ExtractByString<(typeof stageNames)[number]>;

type Textures = {
	color?: Texture;
	alpha?: Texture;
	ao?: Texture;
	displament?: Texture;
	normal?: Texture;
	roughness?: Texture;
	metalness?: Texture;
	env?: Texture;
};
