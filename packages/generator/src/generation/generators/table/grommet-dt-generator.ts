import ts, { factory } from "typescript"
import { createFunctionalComponent, createJsxElement, TableComponent, createJsxSelfClosingElement, createJsxAttribute } from '../../react-components/react-component-helper'
import { Entity, Property } from '../../entity/index'
import { TableGenerator } from './table-generator-factory'
import { TableComponentDefinitionBase } from '../../../definition/table-definition-core'
import GenerationContext from "../../context"
import TableGeneratorBase from './table-generator-base'
import { GrommetDtTableComponents } from '../../../definition/grommet/table'

export default class GrommetDataTableGenerator extends TableGeneratorBase implements TableGenerator 
{
    constructor(generationContext: GenerationContext) {
        super(generationContext);
    }

    getTableDefinition() : TableComponentDefinitionBase {
        return GrommetDtTableComponents;
    }
    
    generateTableComponent(): TableComponent {
        var statements = this.createStatements();
        var functionalComponent = createFunctionalComponent("DataTableComponent", [], statements);
        
        return {functionDeclaration: functionalComponent, imports: this.uniqueImports()};
    }

    private createStatements(): ts.Statement[] {
        let statements = new Array<ts.Statement>();
  
        let columnsIdentifier = factory.createIdentifier("columns");  
        let columnsDeclaration = this.createColumns(columnsIdentifier);
        var columnAttribute = createJsxAttribute("columns", "columns")
        statements.push(factory.createVariableStatement(undefined, columnsDeclaration))
  
        var dataGridComponent = this.prepareComponent(this.getTableDefinition().table);
        statements.push(factory.createReturnStatement(factory.createParenthesizedExpression(createJsxSelfClosingElement(dataGridComponent.tagName, [columnAttribute]))));
  
        return statements;
      }
  
    private createColumns(columnsIdentifier: ts.Identifier):ts.VariableDeclarationList {
        let propertiesColumnDefinitions = Array<ts.ObjectLiteralExpression>();

        this.getProperties().forEach(property => {
            propertiesColumnDefinitions.push(this.createColumnDefinition(property));
        });

        return factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
            columnsIdentifier,
            undefined,
            undefined,
            factory.createArrayLiteralExpression(
                propertiesColumnDefinitions,
                true
            )
            )],
            ts.NodeFlags.Const
        )
    }

    private createColumnDefinition(property: Property): ts.ObjectLiteralExpression {
        let properties : ts.ObjectLiteralElementLike[] =  [
            factory.createPropertyAssignment(
              factory.createIdentifier("property"),
              factory.createStringLiteral(property.getName())
            ),
            factory.createPropertyAssignment(
              factory.createIdentifier("header"),
              this.getHeaderTitle(property)
            )
        ];

        if(this.context.useFormatter){
            properties.push(factory.createPropertyAssignment(
                factory.createIdentifier("render"),
                this.getRender(property)
              ))
        }

        return factory.createObjectLiteralExpression(properties,false)
    }

    private getRender(property: Property):ts.ArrowFunction {
        let formattedTag: ts.JsxSelfClosingElement = this.intlFormatter.formatPropertyUsingTag(property, factory.createJsxExpression(undefined, factory.createIdentifier("val")))

        return factory.createArrowFunction(
            undefined,
            undefined,
            [factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              factory.createIdentifier("val"),
              undefined,
              undefined,
              undefined
            )],
            undefined,
            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            factory.createParenthesizedExpression(formattedTag)
          )
    }


}