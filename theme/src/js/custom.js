var hexToRgb = function(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16)/255,
    g: parseInt(result[2], 16)/255,
    b: parseInt(result[3], 16)/255
  } : null;
};

var meshes = {
  0 : {
    path: 'assets/meshes/column/',
    fileName: 'column.babylon'
  },
  1 : {
    path: 'assets/meshes/buddha/',
    fileName: 'buddha.babylon'
  },
};

var animateBuddha = function () {

  var canvas = document.getElementById("canvas__statue");
  var engine = new BABYLON.Engine(canvas, true);

  var createScene = function () {
    scene = new BABYLON.Scene(engine);

    // ambient light?
    var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);

    // directional light
    var light1 = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, -1, 0), scene);
    var color1 = '#af9898';
    light1.diffuse = new BABYLON.Color3(hexToRgb(color1).r, hexToRgb(color1).g, hexToRgb(color1).b);

    // spot light
    var light2 = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(50, 30, -10), new BABYLON.Vector3(0, -1, 0), 0.8, 2, scene);
    var color2 = '#fef9b9';
    light2.diffuse = new BABYLON.Color3(hexToRgb(color2).r, hexToRgb(color2).g, hexToRgb(color2).b);
    light2.specular = new BABYLON.Color3(1, 1, 1);

    // adding an Arc Rotate Camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0.0, 1.35, 100, BABYLON.Vector3.Zero(), scene);
    // camera.attachControl(canvas, false);

    // set transparent background
    scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);

    // load column
    BABYLON.SceneLoader.ImportMesh("", meshes[0].path, meshes[0].fileName, scene, function (newMeshes) {
      var mesh = newMeshes[0];
      // Set the target of the camera to the first imported mesh
      mesh.scaling = new BABYLON.Vector3(15.0, 15.0, 15.0);
      mesh.translate(BABYLON.Axis.Y, -130.0, BABYLON.Space.WORLD);
      mesh.rotation = new BABYLON.Vector3(0.0, -(Math.PI/4), 0.0);
    });

    // load buddha
    BABYLON.SceneLoader.ImportMesh("", meshes[1].path, meshes[1].fileName, scene, function (newMeshes) {
      var mesh = newMeshes[0];
      // Set the target of the camera to the first imported mesh
      // camera.target = mesh;
      mesh.translate(BABYLON.Axis.Y, -10.0, BABYLON.Space.WORLD);
      mesh.scaling = new BABYLON.Vector3(30.0, 30.0, 30.0);
      mesh.rotation = new BABYLON.Vector3(0.0, -(Math.PI/4), 0.0);

      scene.registerBeforeRender(function() {
        mesh.rotation.y -= 0.003;
      });
    });

    // Move the light with the camera
    scene.registerBeforeRender(function () {
      light0.position = camera.position;
    });

    return scene;
  };


  var scene = createScene();

  engine.runRenderLoop(function () {
    scene.render();
    //scene.debugLayer.show();
  });

  // Resize
  window.addEventListener("resize", function () {
    engine.resize();
  });
}

animateBuddha()