// forked from cx20's "Three.js + Cannon.js でドット絵を落下させてみるテスト" http://jsdo.it/cx20/7Zay
// forked from cx20's "Stats.js で cannon.js の FPS を計測してみるテスト" http://jsdo.it/cx20/nEVns
// forked from Kon's "俺のキャノン砲を試してみるかい？" http://jsdo.it/Kon/1ksj

"use strict";

// ‥‥‥‥‥‥‥‥‥‥‥‥‥□□□
// ‥‥‥‥‥‥〓〓〓〓〓‥‥□□□
// ‥‥‥‥‥〓〓〓〓〓〓〓〓〓□□
// ‥‥‥‥‥■■■□□■□‥■■■
// ‥‥‥‥■□■□□□■□□■■■
// ‥‥‥‥■□■■□□□■□□□■
// ‥‥‥‥■■□□□□■■■■■‥
// ‥‥‥‥‥‥□□□□□□□■‥‥
// ‥‥■■■■■〓■■■〓■‥‥‥
// ‥■■■■■■■〓■■■〓‥‥■
// □□■■■■■■〓〓〓〓〓‥‥■
// □□□‥〓〓■〓〓□〓〓□〓■■
// ‥□‥■〓〓〓〓〓〓〓〓〓〓■■
// ‥‥■■■〓〓〓〓〓〓〓〓〓■■
// ‥■■■〓〓〓〓〓〓〓‥‥‥‥‥
// ‥■‥‥〓〓〓〓‥‥‥‥‥‥‥‥
var dataSet = [
    "無","無","無","無","無","無","無","無","無","無","無","無","無","肌","肌","肌",
    "無","無","無","無","無","無","赤","赤","赤","赤","赤","無","無","肌","肌","肌",
    "無","無","無","無","無","赤","赤","赤","赤","赤","赤","赤","赤","赤","肌","肌",
    "無","無","無","無","無","茶","茶","茶","肌","肌","茶","肌","無","赤","赤","赤",
    "無","無","無","無","茶","肌","茶","肌","肌","肌","茶","肌","肌","赤","赤","赤",
    "無","無","無","無","茶","肌","茶","茶","肌","肌","肌","茶","肌","肌","肌","赤",
    "無","無","無","無","茶","茶","肌","肌","肌","肌","茶","茶","茶","茶","赤","無",
    "無","無","無","無","無","無","肌","肌","肌","肌","肌","肌","肌","赤","無","無",
    "無","無","赤","赤","赤","赤","赤","青","赤","赤","赤","青","赤","無","無","無",
    "無","赤","赤","赤","赤","赤","赤","赤","青","赤","赤","赤","青","無","無","茶",
    "肌","肌","赤","赤","赤","赤","赤","赤","青","青","青","青","青","無","無","茶",
    "肌","肌","肌","無","青","青","赤","青","青","黄","青","青","黄","青","茶","茶",
    "無","肌","無","茶","青","青","青","青","青","青","青","青","青","青","茶","茶",
    "無","無","茶","茶","茶","青","青","青","青","青","青","青","青","青","茶","茶",
    "無","茶","茶","茶","青","青","青","青","青","青","青","無","無","無","無","無",
    "無","茶","無","無","青","青","青","青","無","無","無","無","無","無","無","無"
];

function getRgbColor( c )
{
    var colorHash = {
        "無":0xDCAA6B,    // 段ボール色
        "白":0xffffff,
        "肌":0xffcccc,
        "茶":0x800000,
        "赤":0xff0000,
        "黄":0xffff00,
        "緑":0x00ff00,
        "水":0x00ffff,
        "青":0x0000ff,
        "紫":0x800080
    };
    return colorHash[ c ];
}

var TIME_STEP = 1 / 30;
var SCREEN_WIDTH = 465;
var SCREEN_HEIGHT = 465;
var VIEW_ANGLE = 60;
var TABLE_HIEGHT = 70;
var N = 256;
var Table_positon = 1000;
var world, camera, scene, renderer, rendererElement, Mycanvas, axis, table, Table;
var controls;
var player_list = [];
//var stats;
    
class kesigomuBox{
    constructor(body,color){
        this.kesigomu = body;
        this.color = color;
        this.angle = Math.PI/2;
        this.v0 = 0;
        //まぎらわしいからx,zでやる
        this.vx = 0;
        this.vz = 10;
        this.line = null;
        this.cone = null;
    }

    init(){

    }

    move(){
        this.v0 = this.v0 - 2 * (TIME_STEP);
        this.kesigomu.position.copy(this.kesigomu.rigidBody.position);
        this.kesigomu.quaternion.copy(this.kesigomu.rigidBody.quaternion);
        if(this.v0 < 0){
            //this.kesigomu.rigidBody.velocity.set(0,this.kesigomu.rigidBody.position.y,0);
        }
    }

}


function init() {
    // Stats
    //var parentElement = document.body;

    //ワールド生成
    // initialize cannon.js's world
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase(); //ぶつかっている可能性のあるオブジェクト同士を見つける
    world.solver.iterations = 10; //反復計算回数
    world.solver.tolerance = 0.1; //許容範囲

    
    // initialize three.js's scene, camera and renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;


    Mycanvas = document.getElementById("mycanvas");
    Mycanvas.appendChild(renderer.domElement);
    //parentElement.appendChild(renderer.domElement);
    

    scene = new THREE.Scene();
    //XYZ軸の表示（引数は表示範囲）
    axis = new THREE.AxisHelper(100000);
    //軸の開始位置
    axis.position.set(0,0,0);
    //画面への軸の追加
    scene.add(axis);
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
    camera.position.x = 50;
    camera.position.y = 80 + TABLE_HIEGHT;
    camera.position.z = 55;
    controls = new THREE.OrbitControls(camera,renderer.domElement);

    initLights();
    initGround();
    createShapes();
    createtable();
}


// initialize lights
function initLights() {
    var directionalLight, ambientLight, spotlight;
    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0, 50, 0);
    //directionalLight.castShadow = true;
    scene.add(directionalLight);
    ambientLight = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambientLight);
    spotlight = new THREE.SpotLight(0xFFFFFF, 2, 100, Math.PI / 4, 1);
    // ライトに影を有効にする
    spotlight.castShadow = true;
    scene.add(spotlight);
}

// ground
function initGround() {
    //地面の生成 質量0
    //var groundShape = new CANNON.Plane(new CANNON.Vec3(50, 5, 50));
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({mass: 0});
    groundBody.addShape(groundShape);

    //地面をx軸に対して90度回転
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.castShadow = true;
    world.add(groundBody);

    // initialize Object3D
    var plane = createPlane(50, 50);
    //plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    scene.add(plane);
}

function createPlane(w, h) {
    //var loader = new THREE.TextureLoader();
    //var texture = loader.load("https://jsrun.it/assets/u/y/G/y/uyGy9.jpg"); // grass.jpg
    //texture.wrapS   = texture.wrapT = THREE.RepeatWrapping;
    //texture.repeat.set( 5, 5 );  
    //var material = new THREE.MeshLambertMaterial( { color: 0x777777, map: texture } );
    var material = new THREE.MeshLambertMaterial( { color: 0x777777} );
    var geometry = new THREE.PlaneGeometry( w, h );
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

// create a shape
function createShape(x,y,z,w,h,d,mass,color) {
    var geometry, material, mesh, shape, body, kesigomu_material;
    

    //table マテリアル このマテリアルがないと反発係数がつかない
    kesigomu_material = new CANNON.Material('table_material');
    kesigomu_material.friction = 0.3; //摩擦係数
    kesigomu_material.restitution = 0.7; //反発係数
    // initialize rigid body
    //公式ドキュメントにもhalfelementsって書いてあるので幅　高さ　奥行きの半分を与える。多分物理演算のために半分になってる
    shape = new CANNON.Box(new CANNON.Vec3(w, h, d));
    //shape = new CANNON.Sphere(w);
    body = new CANNON.Body({mass: mass});
    body.material = kesigomu_material;
    body.addShape(shape);
    x = Math.random()*40 - 20;
    z = Math.random()*40 - 20;
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    //body.angularVelocity.set(0, 5, 10);   //角速度
    body.angularDamping = 0.1;　　　//減衰率
    //body.quaternion.set(Math.random()/50, Math.random()/50, Math.random()/50, 0.2);
    world.add(body);

    // initialize Object3D
    //geometry = new THREE.SphereGeometry(w, 10, 10);
    //幅　高さ　奥行き
    //geometry = new THREE.CubeGeometry(w*2, h*2, d*2);
    geometry = new THREE.BoxGeometry(w*2, h*2, d*2);
    let materials = [
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 1.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 2.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 3.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 4.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 5.png
        new THREE.MeshStandardMaterial({color: Math.round(color)})  // 6.png
    ];
    material = new THREE.MeshFaceMaterial(materials);

    mesh = new THREE.Mesh(geometry, material);
    //この辺が人によって違う。ようは物理イメージをthreeオブジェクトにもたせてる
    mesh.rigidBody = body; // THREE.Object3D#rigidBody has a field of CANNON.RigidBody
    //mesh.castShadow = true;
    scene.add(mesh);

    let id = Math.floor(Math.random() * 1000000000);
    player_list[id] = new kesigomuBox(mesh,color);

}


// sphere
function createShapes() {
    /*
    var box_size = 0.7;
    for ( var y = 0; y < 16; y++ ) {
        for ( var x = 0; x < 16; x++ ) {
            var x1 = -15 + x * box_size * 2.5;
            var y1 = (15 - y) * box_size * 3.0 + 40;
            var z1 = 0;
            var color = getRgbColor( dataSet[y * 16 + x] );
            createShape(x1, y1, z1, box_size, box_size, box_size, 1, color);
        }
    }
    */
   createShape(0,50+TABLE_HIEGHT,0,1,0.7,2,10,0xFFFFFF);
   createShape(0,50+TABLE_HIEGHT,5,1,0.7,2,10,0xFF0000);

}

function createtable(){
    var geometry, material, shape, table_material, Table_leg;
    let w = 25;
    let h = 1;
    let d = 25;
    let color = 0xDCAA6B;

    //table マテリアル
    table_material = new CANNON.Material('table_material');
    table_material.friction = 0.01;　//摩擦係数
    table_material.restitution = 0.2; //反発係数
    // initialize rigid body
    //公式ドキュメントにもhalfelementsって書いてあるので幅　高さ　奥行きの半分を与える。多分物理演算のために半分になってる
    shape = new CANNON.Box(new CANNON.Vec3(w, h, d));
    table = new CANNON.Body({mass: 0});
    table.material = table_material;
    table.addShape(shape);
    table.position.x = 0;
    table.position.y = TABLE_HIEGHT;
    table.position.z = 0;
    //table.quaternion.set(Math.random()/50, Math.random()/50, Math.random()/50, 0.2);
    world.add(table);

    // initialize Object3D
    //geometry = new THREE.SphereGeometry(w, 10, 10);
    //幅　高さ　奥行き
    //geometry = new THREE.CubeGeometry(w*2, h*2, d*2);
    geometry = new THREE.BoxGeometry(w*2, h*2, d*2);
    //geometry = new THREE.BoxGeometry(1,1,1);
    let materials = [
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 1.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 2.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 3.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 4.png
        new THREE.MeshStandardMaterial({color: Math.round(color)}), // 5.png
        new THREE.MeshStandardMaterial({color: Math.round(color)})  // 6.png
    ];
    material = new THREE.MeshFaceMaterial(materials);

    Table = new THREE.Mesh(geometry, material);
    //この辺が人によって違う。ようは物理イメージをthreeオブジェクトにもたせてる
    Table.rigidBody = table; // THREE.Object3D#rigidBody has a field of CANNON.RigidBody
    //Table.receiveShadow = true;
    scene.add(Table);

    geometry = new THREE.BoxGeometry(2,TABLE_HIEGHT,2);
    
    let l = [[1,1],[1,-1],[-1,1],[-1,-1]]
    for(let i=0;i<4;i++){
        Table_leg = new THREE.Mesh(geometry,material);
        Table_leg.position.x = 23*l[i][0];
        Table_leg.position.y = TABLE_HIEGHT/2;
        Table_leg.position.z = 23*l[i][1];
        scene.add(Table_leg);
    }

}

function drawangle(){

    Object.values(player_list).forEach((player) =>{
        let material,geometry,Vx,Vz,line,cone;
        scene.remove(player.line);
        scene.remove(player.cone);
        material = new THREE.LineBasicMaterial({color:0x800080,linewidth: 6});
        geometry = new THREE.Geometry();
        Vx = Math.cos(player.angle) * 4 + player.kesigomu.rigidBody.position.x;
        Vz = Math.sin(player.angle) * 4 + player.kesigomu.rigidBody.position.z;
        geometry.vertices.push(
            new THREE.Vector3(player.kesigomu.rigidBody.position.x,player.kesigomu.rigidBody.position.y,player.kesigomu.rigidBody.position.z),
            new THREE.Vector3(Vx,player.kesigomu.rigidBody.position.y,Vz),
        );
        line = new THREE.Line(geometry,material);
        player.line = line;
        scene.add(line);

        geometry = new THREE.ConeGeometry(0.4,1,20);
        material = new THREE.MeshBasicMaterial({color:0x800080});
        cone = new THREE.Mesh(geometry,material);
        cone.position.x = Vx;
        cone.position.y = player.kesigomu.rigidBody.position.y;
        cone.position.z = Vz;
        cone.rotation.x = Math.PI/2;
        cone.rotation.z = player.angle - Math.PI/2;
        player.cone = cone;
        scene.add(cone)
    });
    
}

function animate() {
    // step physical simulation
    world.step(TIME_STEP);
    // position graphical object on physical object recursively
    (function updateObject3D(mesh) {
        if (mesh.rigidBody) {
            mesh.position.copy(mesh.rigidBody.position);
            mesh.quaternion.copy(mesh.rigidBody.quaternion);
        }
        if (mesh.children) {
            mesh.children.map(updateObject3D);
        }
    })(scene);
    Table.position.x = 0;
    Table.position.y = TABLE_HIEGHT;
    Table.position.z = 0;
    Table.rigidBody.position.x = 0;
    Table.rigidBody.position.y = TABLE_HIEGHT;
    Table.rigidBody.position.z = 0;

    Object.values(player_list).forEach((player) =>{
        player.move();
    });

    drawangle();

    // render graphical object
    camera.lookAt(new THREE.Vector3(0,80,0));
    renderer.render(scene, camera);
    controls.update();
    // request next frame
    requestAnimationFrame(animate);
}


$(document).on('keydown',(event)=>{

    //L
    if(event.keyCode===76){
        
        Object.values(player_list).forEach((player) => {
            if(player.color === 0xFF0000){
                player.v0 = 20;
                player.vx = player.v0 * Math.cos(player.angle);
                player.vz = player.v0 * Math.sin(player.angle);
                console.log(player.vx + ':::' + player.vz);
                player.kesigomu.rigidBody.velocity.set(player.vx,0,player.vz);
            }
        });
    }

    //D
    if(event.keyCode===68){
        Object.values(player_list).forEach((player) => {
            if(player.color === 0xFF0000){
                player.angle = player.angle + 0.05;
            }
        });
    }
    //A
    if(event.keyCode===65){
        Object.values(player_list).forEach((player) => {
            if(player.color === 0xFF0000){
                player.angle = player.angle - 0.05;
            }
        });
    }
});


init();
animate();
