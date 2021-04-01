rm ./assets/js/scripts.min.js
rm ./assets/js/scripts.es6.min.js
rm ./assets/js/scripts.es5.min.js

# We are specifying the target here and not at tsconfig.json
# https://www.typescriptlang.org/docs/handbook/compiler-options.html (--target section)

# ECMASCRIPT_2015 and ES6 are the same thing...
# https://github.com/google/closure-compiler/wiki/Flags-and-Options
# We need ECMASCRIPT_2015 (without async/await support) because of a few old Android devices...

tsc --target ES2017
java -jar /d/Tools/closure-compiler.jar --js ./assets/js/scripts.js --js_output_file ./assets/js/scripts.min.js --language_in ECMASCRIPT_2017 --language_out ECMASCRIPT_2017 --strict_mode_input --compilation_level SIMPLE
rm ./assets/js/scripts.js

tsc --target ES2015
java -jar /d/Tools/closure-compiler.jar --js ./assets/js/scripts.js --js_output_file ./assets/js/scripts.es6.min.js --language_in ECMASCRIPT_2015 --language_out ECMASCRIPT_2015 --strict_mode_input --compilation_level SIMPLE
rm ./assets/js/scripts.js

tsc --target ES5
java -jar /d/Tools/closure-compiler.jar --js ./assets/js/scripts.js --js_output_file ./assets/js/scripts.es5.min.js --language_in ECMASCRIPT5_STRICT --language_out ECMASCRIPT5_STRICT --strict_mode_input --compilation_level SIMPLE
rm ./assets/js/scripts.js
