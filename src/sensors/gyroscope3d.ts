export const gyroscope3D = (function() {
  let instance;

  function createInstance(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // debug code start
    /*
    canvas.style.zIndex = 99999;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    document.body.appendChild(canvas);
    */
    // debug code end

    try {
      var renderer = new window.zen3d.Renderer(canvas, { antialias: true, alpha: true });
    } catch(e) {
      return false;
    }

    renderer.glCore.state.colorBuffer.setClear(0, 0, 0, 0);

    var scene = new window.zen3d.Scene();

    var lambert = new window.zen3d.LambertMaterial();
    lambert.diffuse.setHex(0x468DDF);

    var cube_geometry = new window.zen3d.CubeGeometry(10, 2, 10);
    var cube = new window.zen3d.Mesh(cube_geometry, lambert);
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = 0;
    scene.add(cube);

    var ambientLight = new window.zen3d.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    var pointLight = new window.zen3d.PointLight(0xffffff, 1, 100);
    pointLight.position.set(-20, 40, 10);
    scene.add(pointLight);

    var camera = new window.zen3d.Camera();
    camera.position.set(0, 13, 13);
    camera.lookAt(new window.zen3d.Vector3(0, 0, 0), new window.zen3d.Vector3(0, 1, 0));
    camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);
    scene.add(camera);


    return {
      resize: function(width, height) {
        camera.setPerspective(
          45 / 180 * Math.PI,
          width / height,
          1,
          1000
        );
      },

      render: function(ax, ay, az) {
        cube.euler.x = Math.PI * ax / 360;
        cube.euler.y = Math.PI * ay / 360;
        cube.euler.z = Math.PI * az / 360;
        renderer.render(scene, camera);
        return canvas;
      }
    }
  }

  return {
    getInstance: function(width, height) {
      if(!instance) {
        instance = createInstance(width, height);
      } else {
        instance.resize(width, height)
      }
      return instance;
    }
  }

})();
