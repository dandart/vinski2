import {vec3, vec4, mat4} from 'gl-matrix';
import Model from './model';
import Mesh from './mesh';

const T = 2 * Math.PI;

export default class SceneGraph {
    constructor(program, gl, gldata, glutils, buffers, camera, proj) {
        this.gl = gl;
        this.program = program;
        this.gldata = gldata;
        this.glutils = glutils;
        this.buffers = buffers;
        this.camera = camera;
        this.proj = proj;
        this.objModels = [];
        this.objMeshes = {};
    }

    draw() {
        for (let strSceneName in this.objModels) {
            for (let strModelName in this.objModels[strSceneName]) {
                this.objModels[strSceneName][strModelName].draw(
                    strSceneName,
                    this.objMeshes[strSceneName],
                    this.program
                );
            }
        }
    }

    addResistances(camera) {
        camera.resistance = vec3.create();
        let noResi = 0;
        for (let strSceneName in this.objModels) {
            for (let strModelName in this.objModels[strSceneName]) {
                let modelResistance = this.objModels[strSceneName][strModelName]
                    .getCollisionMatrixSphere(
                        camera.position,
                        2,
                        this.objMeshes[strSceneName]
                    );

                if (modelResistance[0] ||
                    modelResistance[1] ||
                    modelResistance[2]
                ) {
                    noResi++;

                    vec3.add(
                        camera.resistance,
                        camera.resistance,
                        modelResistance
                    );
                }
            }
        }
        if (noResi) {
            vec3.scale(camera.resistance, camera.resistance, 1/noResi);
        }
    }

    addAllObjects(objModelArrays) {
        for (let name in objModelArrays) {
            this.addObjects(name, objModelArrays[name]);
        }
    }

    addModel(strSceneName, arr, child, mTrans) {
        let myTrans = mat4.fromValues(...child.transformation);

        // fuck
        mat4.transpose(myTrans, myTrans);

        if (mTrans) {
            mat4.mul(myTrans, mTrans, myTrans);
        }
        let model = new Model(
            this.gldata,
            this.glutils,
            this.camera,
            this.proj,
            child.name,
            this,
            child.meshes,
            myTrans
        );

        if ('undefined' === typeof this.objModels[strSceneName]) {
            this.objModels[strSceneName] = [];
        }

        this.objModels[strSceneName].push(model);

        if ('undefined' !== typeof child.children) {
            for (let child2 of child.children) {
                model.addModel(strSceneName, arr, child2);
            }
        }
    }

    addMeshes(strSceneName, arr) {
        for (let meshId in arr.meshes) {
            let arrMesh = arr.meshes[meshId],
                materialProperties = arr.materials[arrMesh.materialindex].properties,
                colour = vec4.create(),
                texture = null;

            for (let property of materialProperties) {
                switch (property.key) {
                    case '$clr.diffuse':
                        vec4.add(colour, colour, vec4.fromValues(...property.value, 1.0));
                        break;
                    case '$clr.ambient':
                        //vec4.add(colour, colour, vec4.fromValues(...property.value, 1.0));
                        break;
                    case '$clr.specular':
                        //vec4.add(colour, colour, vec4.fromValues(...property.value, 1.0));
                        break;

                    case '$tex.file':
                        texture = property.value;
                        break;
                    default:
                }
            }

            let mesh = new Mesh(
                this.gl,
                this.gldata,
                this.program,
                this.buffers,
                arrMesh.name,
                arrMesh.vertices,
                [].concat.apply([], arrMesh.faces),
                arrMesh.texturecoords?arrMesh.texturecoords[0]:[],
                arrMesh.normals,
                colour,
                texture
            );

            if ('undefined' === typeof this.objMeshes[strSceneName]) {
                this.objMeshes[strSceneName] = {};
            }
            this.objMeshes[strSceneName][meshId] = mesh;
        }
    }

    addObjects(strSceneName, arr) {
        //console.log(arr);
        let trans = mat4.create();
        mat4.identity(trans);
        switch (strSceneName) {
            case 'vinski1':
                // Leave it alone
                break;
            case 'tunnel':
                mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.rotate(trans, trans, 3*T/4, vec3.fromValues(0, 1, 0));
                mat4.translate(trans, trans, vec3.fromValues(0, 4, 20));
                break;
            case 'player':
                mat4.translate(trans, trans, vec3.fromValues(6, 0, 0));
                mat4.scale(trans, trans, vec3.fromValues(0.12, 0.12, 0.12));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 1, 0));
                break;
            case 'bob':
                mat4.translate(trans, trans, vec3.fromValues(-5, -6, 2.5));
                mat4.scale(trans, trans, vec3.fromValues(25, 25, 25));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 1, 0));
                break;
            case 'director':
                mat4.translate(trans, trans, vec3.fromValues(-5, -12, 1.5));
                mat4.scale(trans, trans, vec3.fromValues(25, 25, 25));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 1, 0));
                break;
            case 'platform':
                mat4.translate(trans, trans, vec3.fromValues(0, 7, -2));
                mat4.rotate(trans,trans,T/12, vec3.fromValues(1, 0, 0));
                break;
            case 'cthulhu':
                mat4.translate(trans, trans, vec3.fromValues(0, 0, 5));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 0, 1));
                mat4.rotate(trans, trans, -T/4, vec3.fromValues(1, 0, 0));
                mat4.scale(trans, trans, vec3.fromValues(0.05, 0.05, 0.05));
                break;
            case 'fnord':
                mat4.translate(trans, trans, vec3.fromValues(-5, -20, 5));
                mat4.rotate(trans, trans, T/3, vec3.fromValues(0, 0, 1));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.scale(trans, trans, vec3.fromValues(0.1, 0.1, 0.1));
                break;
            case 'discoin':
                mat4.translate(trans, trans, vec3.fromValues(-4, 15, 8));
                mat4.scale(trans, trans, vec3.fromValues(0.2, 0.2, 0.2));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 0, 1));
                mat4.rotate(trans, trans, -T/4, vec3.fromValues(0, 1, 0));
                break;
            case 'handoferis':
                mat4.translate(trans, trans, vec3.fromValues(-15, -3, 12));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 0, 1));
                mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.scale(trans, trans, vec3.fromValues(0.1, 0.1, 0.1));
                break;
            case 'macaw':
                mat4.translate(trans, trans, vec3.fromValues(0, 6, 5));
                break;
            case 'orb':
                mat4.translate(trans, trans, vec3.fromValues(-8, -8, 6));
                //mat4.rotate(trans, trans, T/4, vec3.fromValues(0, 0, 1));
                //mat4.rotate(trans, trans, T/4, vec3.fromValues(1, 0, 0));
                mat4.scale(trans, trans, vec3.fromValues(4, 4, 4));
                break;
            default:
                console.log('Dunno where to put', strSceneName);
        }

        this.addMeshes(strSceneName, arr);
        this.addModel(strSceneName, arr, arr.rootnode, trans);
    }

    getMat4() {
        let mat = mat4.create();
        mat4.identity(mat);
        return mat;
    }
}
