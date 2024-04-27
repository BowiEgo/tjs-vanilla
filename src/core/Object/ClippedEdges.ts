import * as THREE from 'three';
import BaseObject from './BaseObject';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';
import { MeshBVH, MeshBVHHelper, CONTAINED } from 'three-mesh-bvh';
import { disposeMeshes } from '../Utils';

export interface clippedEdges {
	clippingPlanes: THREE.Plane[];
	planeMesh: THREE.Mesh;
	outlineLines: THREE.LineSegments;
	mergedMesh: THREE.Mesh;
}

const params = {
	helperDepth: 10,
	displayModel: false,
	useBVH: true,
};

const tempVector = new THREE.Vector3();
const tempVector1 = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();
const tempVector3 = new THREE.Vector3();
const tempLine = new THREE.Line3();
const inverseMatrix = new THREE.Matrix4();
const localPlane = new THREE.Plane();

export default class ClippedEdges {
	context: BaseObject;
	group: THREE.Group;
	clippingPlanes: THREE.Plane[];
	clippingPlanesInvert: THREE.Plane[];
	model: THREE.Mesh | undefined;
	mergedGeometry: THREE.BufferGeometry | undefined;
	planeMesh: THREE.Mesh | undefined;
	outlineLines: THREE.LineSegments | undefined;
	surfaceModel: THREE.Mesh | undefined;
	frontSideModel: THREE.Mesh | THREE.Group | THREE.Object3D | undefined;
	backSideModel: THREE.Mesh | THREE.Group | THREE.Object3D | undefined;
	colliderBvh: MeshBVH | undefined;
	colliderMesh: THREE.Mesh | undefined;
	bvhHelper: MeshBVHHelper | undefined;

	constructor(context: BaseObject) {
		// Setup
		this.context = context;
		context.renderer.localClippingEnabled = true;

		this.group = new THREE.Group();

		this.clippingPlanes = [new THREE.Plane()];
		this.clippingPlanesInvert = [new THREE.Plane()];

		if (context.mesh?.children[0]) {
			this.model = context.mesh?.children[0] as THREE.Mesh;
			context.material = new THREE.MeshBasicMaterial();
			this.model!.position.set(0, 0, 0);
			this.model!.quaternion.identity();
			this.model!.updateMatrixWorld(true);

			this.mergedGeometry = mergeModelMesh(this.model).geometry;

			this.setClippingPlanes();
			this.setOutlineLines();
			this.setSurfaceModel();
			this.setFrontAndBackSideModel(this.clippingPlanesInvert, this.clippingPlanes);
			this.setBVH(this.clippingPlanes);

			// if (this.frontSideModel) this.group.add(this.frontSideModel);
			// if (this.backSideModel) this.group.add(this.backSideModel);
			// if (this.surfaceModel) this.group.add(this.surfaceModel);
			if (this.colliderMesh) this.group.add(this.colliderMesh);
			if (this.outlineLines) this.group.add(this.outlineLines);
			// if (this.bvhHelper) this.group.add(this.bvhHelper);

			this.group.updateMatrixWorld(true);
			this.context.scene.add(this.group);
		}
	}

	setClippingPlanes() {
		const planeMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(),
			new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				stencilWrite: true,
				stencilFunc: THREE.NotEqualStencilFunc,
				stencilFail: THREE.ZeroStencilOp,
				stencilZFail: THREE.ZeroStencilOp,
				stencilZPass: THREE.ZeroStencilOp,
				opacity: 0,
				transparent: true,
			})
		);
		planeMesh.scale.setScalar(2.5);
		planeMesh.rotation.y = Math.PI / 2;
		planeMesh.material.color.set('rgb(118, 255, 232)').convertLinearToSRGB();
		planeMesh.renderOrder = 2;

		this.planeMesh = planeMesh;
	}

	setOutlineLines() {
		if (!this.model) return;
		// create line geometry with enough data to hold 100000 segments
		const lineGeometry = new THREE.BufferGeometry();
		const linePosAttr = new THREE.BufferAttribute(new Float32Array(300000), 3, false);
		linePosAttr.setUsage(THREE.DynamicDrawUsage);
		lineGeometry.setAttribute('position', linePosAttr);
		const outlineLines = new THREE.LineSegments(
			lineGeometry,
			new THREE.LineBasicMaterial({ linewidth: 20 })
		);
		outlineLines.material.color.set('rgb(255, 255, 255)').convertSRGBToLinear();
		outlineLines.frustumCulled = false;
		outlineLines.renderOrder = 3;
		outlineLines.scale.copy(this.model.scale);
		outlineLines.position.set(0, 0, 0);
		outlineLines.quaternion.identity();

		this.outlineLines = outlineLines;
	}

	setSurfaceModel() {
		// color the surface of the geometry with an EQUAL depth to limit the amount of
		// fragment shading that has to run.
		const surfaceModel = this.model!.clone();
		surfaceModel.material = new THREE.MeshStandardMaterial({
			depthFunc: THREE.EqualDepth,
		});
		surfaceModel.renderOrder = 1;

		this.surfaceModel = surfaceModel;
	}

	setFrontAndBackSideModel(
		frontClippingPlanes: THREE.Plane[],
		backClippingPlanes: THREE.Plane[]
	) {
		const matSet = new Set();
		const materialMap = new Map();

		const frontSideModel = this.model;
		frontSideModel!.updateMatrixWorld(true);
		frontSideModel!.traverse((c: any) => {
			if (c.isMesh) {
				if (materialMap.has(c.material)) {
					c.material = materialMap.get(c.material);
					return;
				}

				matSet.add(c.material);

				const material = c.material.clone();
				// material.color.set('rgb(37, 166, 241)');
				material.roughness = 1.0;
				material.metalness = 0.0;
				material.side = THREE.FrontSide;
				material.stencilWrite = true;
				material.stencilFail = THREE.IncrementWrapStencilOp;
				material.stencilZFail = THREE.IncrementWrapStencilOp;
				material.stencilZPass = THREE.IncrementWrapStencilOp;
				material.clippingPlanes = frontClippingPlanes;

				materialMap.set(c.material, material);
				c.material = material;
			}
		});

		materialMap.clear();

		const backSideModel = frontSideModel?.clone();
		backSideModel?.traverse((c: any) => {
			if (c.isMesh) {
				if (materialMap.has(c.material)) {
					c.material = materialMap.get(c.material);
					return;
				}

				const material = c.material.clone();
				material.color.set(0xff00ff);
				material.roughness = 1.0;
				material.metalness = 0.0;
				material.colorWrite = false;
				material.depthWrite = false;
				material.side = THREE.BackSide;
				material.stencilWrite = true;
				material.stencilFail = THREE.DecrementWrapStencilOp;
				material.stencilZFail = THREE.DecrementWrapStencilOp;
				material.stencilZPass = THREE.DecrementWrapStencilOp;
				material.clippingPlanes = backClippingPlanes;

				materialMap.set(c.material, material);
				c.material = material;
			}
		});

		this.frontSideModel = frontSideModel;
		this.backSideModel = backSideModel;
	}

	setBVH(clippingPlanes: THREE.Plane[]) {
		if (this.mergedGeometry && this.model) {
			const colliderBvh = new MeshBVH(this.mergedGeometry, { maxLeafTris: 3 });
			(this.mergedGeometry as any).boundsTree = colliderBvh;
			const colliderMesh = new THREE.Mesh(
				this.mergedGeometry,
				new THREE.MeshBasicMaterial({
					wireframe: true,
					transparent: true,
					opacity: 0.1,
					depthWrite: false,
					clippingPlanes: clippingPlanes,
					color: 'rgb(37, 166, 241)',
				})
			);
			colliderMesh.renderOrder = 2;
			colliderMesh.position.copy(this.model.position);
			colliderMesh.rotation.copy(this.model.rotation);
			colliderMesh.scale.copy(this.model.scale);

			const bvhHelper = new MeshBVHHelper(colliderMesh, params.helperDepth);
			bvhHelper.depth = params.helperDepth;
			bvhHelper.update();

			this.colliderBvh = colliderBvh;
			this.colliderMesh = colliderMesh;
			this.bvhHelper = bvhHelper;
		}
	}

	update() {
		if (!this.planeMesh || !this.colliderMesh || !this.outlineLines || !this.colliderBvh) {
			return;
		}
		this.planeMesh.updateMatrixWorld();

		const clippingPlane = this.clippingPlanes[0];
		clippingPlane.normal.set(0, 0, -1);
		clippingPlane.constant = 0;
		clippingPlane.applyMatrix4(this.planeMesh.matrixWorld);

		// get the clipping plane in the local space of the BVH
		inverseMatrix.copy(this.colliderMesh.matrixWorld).invert();
		localPlane.copy(clippingPlane).applyMatrix4(inverseMatrix);

		let index = 0;
		const posAttr = this.outlineLines.geometry.attributes.position;

		this.colliderBvh.shapecast({
			intersectsBounds: (box) => {
				// if we're not using the BVH then skip straight to iterating over all triangles
				if (!params.useBVH) {
					return CONTAINED;
				}

				return localPlane.intersectsBox(box);
			},

			intersectsTriangle: (tri) => {
				// check each triangle edge to see if it intersects with the plane. If so then
				// add it to the list of segments.
				let count = 0;

				tempLine.start.copy(tri.a);
				tempLine.end.copy(tri.b);
				if (localPlane.intersectLine(tempLine, tempVector)) {
					posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
					index++;
					count++;
				}

				tempLine.start.copy(tri.b);
				tempLine.end.copy(tri.c);
				if (localPlane.intersectLine(tempLine, tempVector)) {
					posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
					count++;
					index++;
				}

				tempLine.start.copy(tri.c);
				tempLine.end.copy(tri.a);
				if (localPlane.intersectLine(tempLine, tempVector)) {
					posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
					count++;
					index++;
				}

				// When the plane passes through a vertex and one of the edges of the triangle, there will be three intersections, two of which must be repeated
				if (count === 3) {
					tempVector1.fromBufferAttribute(posAttr, index - 3);
					tempVector2.fromBufferAttribute(posAttr, index - 2);
					tempVector3.fromBufferAttribute(posAttr, index - 1);
					// If the last point is a duplicate intersection
					if (tempVector3.equals(tempVector1) || tempVector3.equals(tempVector2)) {
						count--;
						index--;
					} else if (tempVector1.equals(tempVector2)) {
						// If the last point is not a duplicate intersection
						// Set the penultimate point as a distinct point and delete the last point
						posAttr.setXYZ(index - 2, tempVector3.x, tempVector3.y, tempVector3.z);
						count--;
						index--;
					}
				}

				// If we only intersected with one or three sides then just remove it. This could be handled
				// more gracefully.
				if (count !== 2) {
					index -= count;
				}
			},
		});

		// // set the draw range to only the new segments and offset the lines so they don't intersect with the geometry
		this.outlineLines.geometry.setDrawRange(0, index);
		this.outlineLines.position.copy(clippingPlane.normal).multiplyScalar(-0.00001);
		posAttr.needsUpdate = true;

		this.planeMesh.position.x = THREE.MathUtils.lerp(
			this.planeMesh.position.x,
			-Math.sin(this.context.time.elapsed / 2) * 6,
			0.005
		);
		this.clippingPlanesInvert[0].constant = THREE.MathUtils.lerp(
			this.clippingPlanesInvert[0].constant,
			Math.sin(this.context.time.elapsed / 2) * 6,
			0.005
		);
	}

	destroy() {
		disposeMeshes(this.group);
		this.context.scene.remove(this.group);
		this.context.renderer.localClippingEnabled = false;
	}
}

function mergeModelMesh(model: THREE.Mesh | THREE.Group | THREE.Object3D) {
	let mergedGeometry = new THREE.BufferGeometry();

	let geometries: THREE.BufferGeometry[] = [];
	model.traverse((item: any) => {
		if (item.isMesh) {
			const instanceGeometry = item.geometry.clone();
			if (!instanceGeometry.attributes.uv1) {
				instanceGeometry.setAttribute('uv1', instanceGeometry.attributes.uv);
			}
			instanceGeometry.applyMatrix4(item.matrix);
			geometries.push(instanceGeometry);
		}
	});

	if (geometries.length > 0) {
		mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
	}

	let mergedMesh = new THREE.Mesh(mergedGeometry, new THREE.MeshBasicMaterial());
	mergedMesh.scale.set(1.0, 1.0, 1.0);
	mergedMesh.position.y = -3.3;
	mergedMesh.quaternion.identity();
	mergedMesh.applyMatrix4(model.matrix);
	mergedMesh.updateMatrixWorld(true);

	return mergedMesh;
}
