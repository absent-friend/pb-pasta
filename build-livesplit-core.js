import { execSync } from "child_process";
import { copyFileSync } from "fs";

execSync('cargo run', {
    cwd: 'lib/livesplit-core/capi/bind_gen',
    stdio: 'inherit'
});

execSync('cargo rustc -p livesplit-core-capi --crate-type cdylib --features wasm-web --target wasm32-unknown-unknown', {
    cwd: 'lib/livesplit-core',
    stdio: 'inherit',
    env: {
        ...process.env,
        RUSTFLAGS: '-C target-feature=+bulk-memory,+mutable-globals,+nontrapping-fptoint,+sign-ext,+simd128,+extended-const,+multivalue,+reference-types,+tail-call'
    }
});

execSync('wasm-bindgen --encode-into always --target web --reference-types lib/livesplit-core/target/wasm32-unknown-unknown/debug/livesplit_core.wasm --out-dir src/livesplit-core', {
    stdio: 'inherit'
});

copyFileSync('lib/livesplit-core/capi/bindings/wasm_bindgen/web/index.ts', 'src/livesplit-core/index.ts');
copyFileSync('lib/livesplit-core/capi/bindings/wasm_bindgen/web/preload.ts', 'src/livesplit-core/preload.ts');