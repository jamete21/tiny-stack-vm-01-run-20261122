// Tiny stack VM for make.fun tiny-stack-vm-01-run-20261122.
// One run answers every instance: 32-bit wrapping ints, a 256-value
// data stack, a 64-address call stack, 256 words, eleven traps.
const fs = require('node:fs');

function run(p, q) {
  const s = new Int32Array(256); // data stack
  const m = new Int32Array(256); // memory
  const c = new Int32Array(64); // call stack
  const o = new Uint8Array(65536); // output bytes
  let sp = 0, cp = 0, pc = 0, ip = 0, ol = 0, st = 0;
  const n = p.length;
  const r = e => ({ o, l: ol, e });
  for (;;) {
    if (st >= 1e6) return r(10); // step limit
    if (pc < 0 || pc >= n) return r(9); // pc outside the program
    const k = p[pc];
    // Valid opcodes: 00-07, 10-1E, 20-22, 30-34, 40-41, 50-53.
    if (!(k < 8 || (k > 15 && k < 31) || (k > 31 && k < 35) || (k > 47 && k < 53) || (k > 63 && k < 66) || (k > 79 && k < 84))) return r(5);
    const il = k === 1 ? 1 : k === 2 ? 4 : (k > 47 && k < 52) ? 2 : 0;
    if (pc + 1 + il > n) return r(9); // immediate cut off at end
    st++;
    let nx = pc + 1 + il, a, b, v;
    if (k === 0) return r(0); // HALT
    else if (k === 1) { if (sp > 255) return r(3); s[sp++] = (p[pc + 1] << 24) >> 24; } // PUSH8, sign-extended
    else if (k === 2) { if (sp > 255) return r(3); s[sp++] = p[pc + 1] | p[pc + 2] << 8 | p[pc + 3] << 16 | p[pc + 4] << 24; } // PUSH32
    else if (k === 3) { if (!sp) return r(2); sp--; } // POP
    else if (k === 4) { if (!sp) return r(2); if (sp > 255) return r(3); s[sp] = s[sp - 1]; sp++; } // DUP
    else if (k === 5) { if (sp < 2) return r(2); a = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = a; } // SWAP
    else if (k === 6) { if (sp < 2) return r(2); if (sp > 255) return r(3); s[sp] = s[sp - 2]; sp++; } // OVER
    else if (k === 7) { if (sp < 3) return r(2); a = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = a; } // ROT (a b c -- b c a)
    else if (k === 23) { if (!sp) return r(2); s[sp - 1] = -s[sp - 1] | 0; } // NEG, wraps
    else if (k === 27) { if (!sp) return r(2); s[sp - 1] = ~s[sp - 1]; } // NOT
    else if (k === 48) nx = nx + ((p[pc + 1] | p[pc + 2] << 8) << 16 >> 16); // JMP, signed 16-bit offset
    else if (k === 49) { if (!sp) return r(2); a = s[--sp]; if (!a) nx = nx + ((p[pc + 1] | p[pc + 2] << 8) << 16 >> 16); } // JZ
    else if (k === 50) { if (!sp) return r(2); a = s[--sp]; if (a) nx = nx + ((p[pc + 1] | p[pc + 2] << 8) << 16 >> 16); } // JNZ
    else if (k === 51) { if (cp > 63) return r(7); c[cp++] = nx; nx = p[pc + 1] | p[pc + 2] << 8; } // CALL, unsigned target
    else if (k === 52) { if (!cp) return r(8); nx = c[--cp]; } // RET
    else if (k === 64) { if (!sp) return r(2); a = s[sp - 1]; if (a < 0 || a > 255) return r(6); s[sp - 1] = m[a]; } // LOAD
    else if (k === 65) { if (sp < 2) return r(2); a = s[--sp]; if (a < 0 || a > 255) return r(6); m[a] = s[--sp]; } // STORE (v addr --), addr on top
    else if (k === 80) { if (!sp) return r(2); a = s[--sp]; v = String(a); if (ol + v.length > 65536) return r(11); for (let i = 0; i < v.length; i++) o[ol++] = v.charCodeAt(i); } // PRINT, decimal ASCII
    else if (k === 81) { if (!sp) return r(2); if (ol > 65535) return r(11); o[ol++] = s[--sp] & 255; } // PUTC, one byte
    else if (k === 82) { if (sp > 255) return r(3); s[sp++] = ip < q.length ? q[ip++] : -1; } // IN, -1 when input is used up
    else if (k === 83) { if (!sp) return r(2); return r(s[--sp] & 255); } // EXIT, low byte
    else { // two-operand ops: 16-22, 24-26, 28-30, 32-34 (a b -- r)
      if (sp < 2) return r(2);
      b = s[--sp]; a = s[sp - 1];
      if (k === 16) v = (a + b) | 0; // ADD
      else if (k === 17) v = (a - b) | 0; // SUB
      else if (k === 18) v = Math.imul(a, b); // MUL, low 32 bits
      else if (k === 19) { if (!b) return r(4); v = (a / b) | 0; } // DIV, truncate toward zero; -2^31/-1 wraps
      else if (k === 20) { if (!b) return r(4); v = a % b; } // MOD, sign follows a; x%-1 is 0
      else if (k === 21) { if (!b) return r(4); v = Math.floor((a >>> 0) / (b >>> 0)); } // DIVU
      else if (k === 22) { if (!b) return r(4); v = (a >>> 0) % (b >>> 0); } // MODU
      else if (k === 24) v = a & b; // AND
      else if (k === 25) v = a | b; // OR
      else if (k === 26) v = a ^ b; // XOR
      else if (k === 28) v = a << (b & 31); // SHL, low 5 bits of count
      else if (k === 29) v = a >> (b & 31); // SHR, arithmetic
      else if (k === 30) v = a >>> (b & 31); // SHRU, logical
      else if (k === 32) v = a === b ? 1 : 0; // EQ
      else if (k === 33) v = a < b ? 1 : 0; // LT, signed
      else v = (a >>> 0) < (b >>> 0) ? 1 : 0; // LTU, unsigned
      s[sp - 1] = v; // Int32Array stores wrap the result to 32 bits
    }
    pc = nx;
  }
}

function main() {
  // The process driver stands in for the /input and /output mounts with
  // these variables; the Docker sandbox mounts the real paths instead.
  const IN = process.env.MAKEFUN_INPUT_DIR || '/input';
  const OUT = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  const ids = fs.readdirSync(IN).sort();
  for (const id of ids) {
    const d = IN + '/' + id;
    let st;
    try { st = fs.statSync(d); } catch (e) { continue; }
    if (!st.isDirectory()) continue;
    let p, q;
    try { p = fs.readFileSync(d + '/program.bin'); } catch (e) { continue; }
    try { q = fs.readFileSync(d + '/input.bin'); } catch (e) { q = Buffer.alloc(0); }
    const t = run(p, q);
    const od = OUT + '/' + id;
    fs.mkdirSync(od, { recursive: true });
    fs.writeFileSync(od + '/stdout.bin', Buffer.from(t.o.buffer, 0, t.l));
    fs.writeFileSync(od + '/exit.txt', t.e + '\n');
  }
}

main();
