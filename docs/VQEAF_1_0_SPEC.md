# VQEAF Theme Format 1.0 — Tóm tắt đặc tả

VQEAF là DSL theme declarative cho Android/Kotlin, dùng đuôi `.vqeaf`, UTF-8, không phải XML/JSON thuần và không thực thi code.

## Header

```vqeaf
@vqeaf 1.0
```

## Cấu trúc chuẩn

```vqeaf
@vqeaf 1.0

<theme id="example" name="Example">
  metadata { version: "1.0.0" }
  palette { primary: "#FF6900" }
  metrics { radius: 10dp }

  <component id="keypad.number" type="button">
    shape { radius: $metrics.radius }
    fill: $palette.primary

    <state name="pressed">
      transform { scale: 0.96 }
    </state>
  </component>
</theme>
```

## Kiểu dữ liệu

- String: `"text"`
- Number: `1`, `0.85`
- Boolean: `true`, `false`
- Null: `null`
- Color: `#RGB`, `#ARGB`, `#RRGGBB`, `#AARRGGBB`
- Units: `dp`, `sp`, `px`, `deg`, `ms`, `s`, `%`
- Array: `[ ... ]`
- Object: `{ ... }`
- Reference: `$palette.orange`, `$metrics.radius`
- Resource reference: `@pumpkin`

## Kế thừa component

```vqeaf
<component id="keypad.number" extends="keypad.base">
  text { size: 24sp }
</component>
```

Rule: object merge đệ quy, scalar child override parent, array replace toàn bộ, state merge theo tên. Engine phải phát hiện vòng lặp inheritance.

## State

State chuẩn: `normal`, `pressed`, `focused`, `selected`, `disabled`, `checked`.

```vqeaf
<state name="pressed">
  shape { fill: "#511328" }
  glow { radius: 18dp }
  transform { scale: 0.96 }
</state>
```

## Animation

```vqeaf
<animation id="pulse">
  duration: 900ms
  loop: true
  easing: easeInOut
  frames: [
    { at: 0% opacity: 0.75 },
    { at: 50% opacity: 1.0 },
    { at: 100% opacity: 0.75 }
  ]
</animation>
```

## Vector resource

```vqeaf
<vector id="pumpkin">
  width: 24dp
  height: 24dp
  viewportWidth: 24
  viewportHeight: 24
  <path fill="#FF6900" data="M12,3 ... Z"/>
</vector>
```

## Image resource extension dùng trong Theme Studio

```vqeaf
<resource id="frame_background" type="image">
  mime: "image/webp"
  encoding: "data-uri"
  data: "data:image/webp;base64,..."
</resource>
```

## Pipeline runtime

```text
VQEAF source
  -> Lexer
  -> Parser
  -> AST
  -> Validator
  -> Reference Resolver
  -> Inheritance Resolver
  -> Compiler
  -> CompiledTheme
  -> Android Renderer
```

Không parse theme trong mỗi frame và không render trực tiếp từ text source.
