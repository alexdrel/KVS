//// [tests/cases/conformance/esDecorators/esDecorators-decoratorExpression.2.ts] ////

//// [esDecorators-decoratorExpression.2.ts]
declare let x: any;
declare let g: <T>(...args: any) => any;
declare let h: () => <T>(...args: any) => any;

{ @x as! class C {} }

{ @x.y as! class C {} }

{ @((x as!).y) class C {} }

{ @g<number>() class C {} }

{ @(g<number>) class C {} }

{ @(h()<number>) class C {} }

{ @(x().y) class C {} }

{ @(x().y()) class C {} }

{ @(x``) class C {} }

{ @(x.y``) class C {} }

{ @(x?.y as!) class C {} }

{ @(x["y"]) class C {} }

{ @(x?.["y"]) class C {} }

{ class C { @x as! m() {} } }

{ class C { @x.y as! m() {} } }

{ class C { @((x as!).y) m() {} } }

{ class C { @g<number>() m() {} } }

{ class C { @(g<number>) m() {} } }

{ class C { @(h()<number>) m() {} } }

{ class C { @(x().y) m() {} } }

{ class C { @(x().y()) m() {} } }

{ class C { @(x``) m() {} } }

{ class C { @(x.y``) m() {} } }

{ class C { @(x?.y as!) m() {} } }

{ class C { @(x["y"]) m() {} } }

{ class C { @(x?.["y"]) m() {} } }


//// [esDecorators-decoratorExpression.2.js]
"use strict";
{
    as;
    class C {
    }
}
{
    as;
    class C {
    }
}
{
    @((x).y)
    class C {
    }
}
{
    @g()
    class C {
    }
}
{
    @(g)
    class C {
    }
}
{
    @(h())
    class C {
    }
}
{
    @(x().y)
    class C {
    }
}
{
    @(x().y())
    class C {
    }
}
{
    @(x ``)
    class C {
    }
}
{
    @(x.y ``)
    class C {
    }
}
{
    @(x?.y)
    class C {
    }
}
{
    @(x["y"])
    class C {
    }
}
{
    @(x?.["y"])
    class C {
    }
}
{
    class C {
        @x
        as;
        m() { }
    }
}
{
    class C {
        @x.y
        as;
        m() { }
    }
}
{
    class C {
        @((x).y)
        m() { }
    }
}
{
    class C {
        @g()
        m() { }
    }
}
{
    class C {
        @(g)
        m() { }
    }
}
{
    class C {
        @(h())
        m() { }
    }
}
{
    class C {
        @(x().y)
        m() { }
    }
}
{
    class C {
        @(x().y())
        m() { }
    }
}
{
    class C {
        @(x ``)
        m() { }
    }
}
{
    class C {
        @(x.y ``)
        m() { }
    }
}
{
    class C {
        @(x?.y)
        m() { }
    }
}
{
    class C {
        @(x["y"])
        m() { }
    }
}
{
    class C {
        @(x?.["y"])
        m() { }
    }
}
