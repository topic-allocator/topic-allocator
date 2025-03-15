{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    utils,
    ...
  }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      python = pkgs.python312;
    in {
      devShell = pkgs.mkShell {
        buildInputs = with pkgs; [
          python

          mypy
          ruff
          black
          pyright

          azure-cli
          azure-functions-core-tools
        ];

        shellHook = ''
          VENV=.venv

          if test ! -d $VENV; then
            ${python}/bin/python -m venv $VENV
          fi
          source ./$VENV/bin/activate

          export PYTHONPATH=`pwd`/$VENV/${python.sitePackages}/:$PYTHONPATH

          pip install -r requirements.txt
        '';

        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath (with pkgs; [
          stdenv.cc.cc
        ]);

        # postShellHook = ''
        #   ln -sf ${python.sitePackages}/* ./.venv/lib/python3.12/site-packages
        # '';
      };
    });
}
