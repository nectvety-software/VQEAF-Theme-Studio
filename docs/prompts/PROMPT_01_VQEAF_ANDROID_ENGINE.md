# Prompt — VQEAF Android/Kotlin Engine

Bạn là Senior Android/Kotlin Framework Engineer. Hãy triển khai **VQEAF Theme Engine** để Android đọc trực tiếp `.vqeaf` và render native, không WebView, không convert runtime sang XML.

Yêu cầu:
- Pipeline: `Lexer -> Parser -> AST -> Validator -> ReferenceResolver -> InheritanceResolver -> Compiler -> Renderer`.
- Typed values: color, number, dp/sp/px, deg, ms/s, %, string, boolean, array, object, reference, resource reference.
- Hỗ trợ `$palette.*`, `$metrics.*`, `extends`, state, animation, vector resource, image resource Data URI.
- Có `CompiledVqeafTheme`, cache component/vector, fallback theme khi parse lỗi.
- Không parse trong `onDraw`/mỗi frame.
- Theme là declarative data, cấm eval/reflection/shell/dynamic code.
- Tương thích Android View/Compose adapter, ưu tiên minSdk 23+.
- Có unit test cho lexer/parser/resolver/inheritance/import lỗi.
- Sau mỗi phase phải build/test và sửa compile error trước khi tiếp tục.
