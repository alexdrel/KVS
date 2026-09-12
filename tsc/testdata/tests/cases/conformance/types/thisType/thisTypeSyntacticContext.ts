// @target: es2015
function f(this: { n: number }) {
}

const o: { n: number, test?: (this: { n: number }) => void } = { n: 1 }
o.test = f

o.test();
(o as!).test();
(o.test as!)();
(o.test as! as! as!)();
(o.test as!)();
(o.test)();

